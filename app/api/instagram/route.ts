import { NextRequest, NextResponse } from "next/server";
import {
  IgApiClient,
  IgCheckpointError,
  IgLoginTwoFactorRequiredError,
} from "instagram-private-api";

interface InstagramComment {
  username: string;
  text: string;
  mentions: string[];
}

// Store pending 2FA data
let pending2FA: {
  ig: IgApiClient;
  twoFactorIdentifier: string;
  username: string;
  postUrl: string;
  minMentions: number;
} | null = null;

// Extract shortcode from Instagram URL
function extractShortcode(url: string): string | null {
  const patterns = [
    /instagram\.com\/(?:[^\/]+\/)?reel\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// Extract mentions from comment text
function extractMentions(text: string): string[] {
  const mentionPattern = /@([A-Za-z0-9_.]+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionPattern.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
}

// Fetch comments from a media
async function fetchComments(
  ig: IgApiClient,
  shortcode: string,
  minMentions: number,
): Promise<{
  allComments: InstagramComment[];
  eligibleComments: InstagramComment[];
}> {
  // Get media ID from shortcode
  const mediaId = await ig.media.urlInfo(
    `https://www.instagram.com/p/${shortcode}/`,
  );

  const allComments: InstagramComment[] = [];
  const commentsFeed = ig.feed.mediaComments(mediaId.pk);

  // Fetch all comments (with pagination)
  let hasMore = true;
  let iterations = 0;
  const maxIterations = 20;

  while (hasMore && iterations < maxIterations) {
    try {
      const items = await commentsFeed.items();

      for (const item of items) {
        const text = item.text || "";
        allComments.push({
          username: item.user.username,
          text,
          mentions: extractMentions(text),
        });
      }

      hasMore = commentsFeed.isMoreAvailable();
      iterations++;
    } catch {
      hasMore = false;
    }
  }

  const eligibleComments = allComments.filter(
    (comment) => comment.mentions.length >= minMentions,
  );

  return { allComments, eligibleComments };
}

// Handle 2FA verification
export async function PUT(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!pending2FA) {
      return NextResponse.json(
        { error: "Önce çekilişi başlatın" },
        { status: 400 },
      );
    }

    const { ig, twoFactorIdentifier, postUrl, minMentions } = pending2FA;

    try {
      // Complete 2FA login
      await ig.account.twoFactorLogin({
        username: pending2FA.username,
        verificationCode: code,
        twoFactorIdentifier,
        verificationMethod: "1", // SMS
        trustThisDevice: "1",
      });

      const shortcode = extractShortcode(postUrl);
      if (!shortcode) {
        pending2FA = null;
        return NextResponse.json(
          { error: "Geçersiz Instagram linki" },
          { status: 400 },
        );
      }

      const { allComments, eligibleComments } = await fetchComments(
        ig,
        shortcode,
        minMentions,
      );
      pending2FA = null;

      return NextResponse.json({
        success: true,
        totalComments: allComments.length,
        eligibleComments: eligibleComments.length,
        comments: eligibleComments,
      });
    } catch (error: any) {
      console.error("2FA verification error:", error);
      pending2FA = null;
      return NextResponse.json(
        { error: "Kod doğrulanamadı. Lütfen doğru ve güncel kodu girin." },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error in 2FA verification:", error);
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postUrl, minMentions } = await request.json();

    if (!postUrl) {
      return NextResponse.json(
        { error: "Instagram gönderi linki gerekli" },
        { status: 400 },
      );
    }

    const shortcode = extractShortcode(postUrl);
    if (!shortcode) {
      return NextResponse.json(
        {
          error:
            "Geçersiz Instagram linki. Lütfen gönderi veya reel linkini kontrol edin.",
        },
        { status: 400 },
      );
    }

    const username = process.env.INSTAGRAM_USERNAME;
    const password = process.env.INSTAGRAM_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Instagram credentials yapılandırılmamış" },
        { status: 500 },
      );
    }

    const ig = new IgApiClient();
    ig.state.generateDevice(username);

    try {
      await ig.account.login(username, password);
    } catch (error: any) {
      // Handle 2FA requirement
      if (error instanceof IgLoginTwoFactorRequiredError) {
        const { two_factor_identifier, obfuscated_phone_number } =
          error.response.body.two_factor_info;

        // Store for the PUT handler
        pending2FA = {
          ig,
          twoFactorIdentifier: two_factor_identifier,
          username,
          postUrl,
          minMentions,
        };

        return NextResponse.json(
          {
            twoFactorRequired: true,
            message: `SMS doğrulama kodu gerekiyor.`,
            phoneNumber: obfuscated_phone_number,
          },
          { status: 401 },
        );
      }

      // Handle checkpoint (security challenge)
      if (error instanceof IgCheckpointError) {
        return NextResponse.json(
          {
            challengeRequired: true,
            message:
              "Instagram güvenlik doğrulaması gerekiyor. Lütfen Instagram uygulamasından hesabınızı doğrulayın ve tekrar deneyin.",
          },
          { status: 401 },
        );
      }

      console.error("Instagram login error:", error);
      return NextResponse.json(
        {
          error:
            "Instagram girişi başarısız. Kullanıcı adı ve şifreyi kontrol edin.",
        },
        { status: 401 },
      );
    }

    // Fetch comments
    const { allComments, eligibleComments } = await fetchComments(
      ig,
      shortcode,
      minMentions,
    );

    return NextResponse.json({
      success: true,
      totalComments: allComments.length,
      eligibleComments: eligibleComments.length,
      comments: eligibleComments,
    });
  } catch (error) {
    console.error("Error in Instagram API:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
