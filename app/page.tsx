"use client";

import { useState, useCallback } from "react";
import LotteryForm from "./components/LotteryForm";
import WinnerDisplay from "./components/WinnerDisplay";
import DrawingAnimation from "./components/DrawingAnimation";

interface Comment {
  username: string;
  text: string;
  mentions: string[];
}

interface Winner {
  username: string;
  comment: string;
  mentionCount: number;
  position: number;
}

type LotteryState =
  | "form"
  | "loading"
  | "drawing"
  | "results"
  | "error"
  | "2fa";

export default function Home() {
  const [state, setState] = useState<LotteryState>("form");
  const [winners, setWinners] = useState<Winner[]>([]);
  const [substitutes, setSubstitutes] = useState<Winner[]>([]);
  const [error, setError] = useState<string>("");
  const [drawConfig, setDrawConfig] = useState({
    winnerCount: 1,
    substituteCount: 0,
    mentionCount: 1,
  });
  const [participants, setParticipants] = useState<Comment[]>([]);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorPhone, setTwoFactorPhone] = useState("");
  const [pendingLink, setPendingLink] = useState("");

  // Manual draw handler - directly uses provided usernames
  const handleManualDraw = useCallback(
    (usernames: string[], winnerCount: number, substituteCount: number) => {
      setDrawConfig({ winnerCount, substituteCount, mentionCount: 0 });

      // Convert usernames to participants
      const manualParticipants: Comment[] = usernames.map((username) => ({
        username,
        text: "",
        mentions: [],
      }));

      setParticipants(manualParticipants);
      setState("drawing");
    },
    [],
  );

  // Auto draw handler - fetches from Instagram API
  const handleDraw = useCallback(
    async (
      link: string,
      mentionCount: number,
      winnerCount: number,
      substituteCount: number,
    ) => {
      setState("loading");
      setError("");
      setDrawConfig({ winnerCount, substituteCount, mentionCount });
      setPendingLink(link);

      try {
        const response = await fetch("/api/instagram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postUrl: link,
            minMentions: mentionCount,
          }),
        });

        const data = await response.json();

        // Check for 2FA requirement
        if (data.twoFactorRequired) {
          setTwoFactorPhone(data.phoneNumber || "");
          setState("2fa");
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Bir hata oluştu");
        }

        if (data.comments.length === 0) {
          setError(
            `Bu gönderide minimum ${mentionCount} etiket içeren yorum bulunamadı.`,
          );
          setState("error");
          return;
        }

        if (data.comments.length < winnerCount + substituteCount) {
          setError(
            `Yeterli katılımcı yok. ${data.comments.length} uygun yorum bulundu, ${winnerCount + substituteCount} kişi (kazanan + yedek) istendi.`,
          );
          setState("error");
          return;
        }

        setParticipants(data.comments);
        setState("drawing");
      } catch (err) {
        console.error("Error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Instagram yorumları alınamadı. Lütfen tekrar deneyin.",
        );
        setState("error");
      }
    },
    [],
  );

  const handleTwoFactorSubmit = async () => {
    if (!twoFactorCode.trim()) return;

    setState("loading");
    try {
      const response = await fetch("/api/instagram", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: twoFactorCode,
          postUrl: pendingLink,
          minMentions: drawConfig.mentionCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Doğrulama başarısız");
      }

      if (data.comments.length === 0) {
        setError(
          `Bu gönderide minimum ${drawConfig.mentionCount} etiket içeren yorum bulunamadı.`,
        );
        setState("error");
        return;
      }

      if (
        data.comments.length <
        drawConfig.winnerCount + drawConfig.substituteCount
      ) {
        setError(
          `Yeterli katılımcı yok. ${data.comments.length} uygun yorum bulundu, ${drawConfig.winnerCount + drawConfig.substituteCount} kişi (kazanan + yedek) istendi.`,
        );
        setState("error");
        return;
      }

      setParticipants(data.comments);
      setTwoFactorCode("");
      setState("drawing");
    } catch (err) {
      console.error("2FA Error:", err);
      setError(err instanceof Error ? err.message : "Doğrulama başarısız");
      setState("error");
    }
  };

  const handleDrawingComplete = useCallback(() => {
    // Rastgele kazananları seç
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    // Select main winners
    const selectedWinners: Winner[] = shuffled
      .slice(0, drawConfig.winnerCount)
      .map((comment, index) => ({
        username: comment.username,
        comment: comment.text,
        mentionCount: comment.mentions.length,
        position: index + 1,
      }));

    // Select substitute winners from remaining
    const remainingParticipants = shuffled.slice(drawConfig.winnerCount);
    const selectedSubstitutes: Winner[] = remainingParticipants
      .slice(0, drawConfig.substituteCount)
      .map((comment, index) => ({
        username: comment.username,
        comment: comment.text,
        mentionCount: comment.mentions.length,
        position: index + 1,
      }));

    setWinners(selectedWinners);
    setSubstitutes(selectedSubstitutes);
    setState("results");
  }, [participants, drawConfig]);

  const handleReset = useCallback(() => {
    setState("form");
    setWinners([]);
    setParticipants([]);
    setError("");
    setTwoFactorCode("");
    setTwoFactorPhone("");
    setPendingLink("");
  }, []);

  return (
    <div className="min-h-screen instagram-gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg">Instagram Çekiliş</h1>
              <p className="text-xs text-gray-500">
                Ücretsiz Rastgele Kazanan Seçici
              </p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="card gradient-border glow-effect">
          {/* Form State */}
          {state === "form" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">🎁 Çekiliş Yap</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Instagram gönderinizden rastgele kazanan seçin
                </p>
              </div>
              <LotteryForm
                onDraw={handleDraw}
                onManualDraw={handleManualDraw}
                isLoading={false}
              />
            </div>
          )}

          {/* Loading State */}
          {state === "loading" && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-lg font-medium">Yorumlar yükleniyor...</p>
              <p className="text-sm text-gray-500">
                Instagram gönderisinden veriler alınıyor
              </p>
            </div>
          )}

          {/* 2FA State */}
          {state === "2fa" && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  SMS Doğrulama Gerekli
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Instagram hesabına giriş için SMS doğrulama kodu gerekiyor.
                </p>
                {twoFactorPhone && (
                  <p className="text-sm text-pink-500 mt-1">
                    Telefon: {twoFactorPhone}
                  </p>
                )}
              </div>
              <div className="max-w-xs mx-auto space-y-4">
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="6 haneli kodu girin"
                  maxLength={6}
                  className="input-field text-center text-2xl tracking-widest"
                />
                <button
                  onClick={handleTwoFactorSubmit}
                  disabled={twoFactorCode.length !== 6}
                  className="btn-instagram w-full disabled:opacity-50"
                >
                  Doğrula ve Devam Et
                </button>
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {state === "error" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {/* Drawing Animation State */}
          {state === "drawing" && (
            <DrawingAnimation
              participants={participants.map((c) => c.username)}
              onComplete={handleDrawingComplete}
            />
          )}

          {/* Results State */}
          {state === "results" && (
            <WinnerDisplay
              winners={winners}
              substitutes={substitutes}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Info Cards */}
        {state === "form" && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold mb-1">%100 Ücretsiz</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hiçbir ücret ödemeden sınırsız çekiliş yapın
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-bold mb-1">Güvenli & Adil</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Şeffaf algoritma ile rastgele seçim garantisi
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-bold mb-1">Hızlı & Kolay</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Saniyeler içinde kazananları belirleyin
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2024 Instagram Çekiliş. Tüm hakları saklıdır.</p>
        <p className="mt-1">Bu uygulama Instagram ile bağlantılı değildir.</p>
      </footer>
    </div>
  );
}
