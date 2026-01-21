"use client";

import { useEffect, useState } from "react";

interface Winner {
  username: string;
  comment: string;
  mentionCount: number;
  position: number;
}

interface WinnerDisplayProps {
  winners: Winner[];
  substitutes?: Winner[];
  onReset: () => void;
}

const CONFETTI_COLORS = [
  "#f09433",
  "#e6683c",
  "#dc2743",
  "#cc2366",
  "#bc1888",
  "#ffd700",
  "#00ff88",
];

function Confetti() {
  const [confetti, setConfetti] = useState<
    { id: number; left: number; color: string; delay: number }[]
  >([]);

  useEffect(() => {
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 2,
    }));
    setConfetti(pieces);

    const timer = setTimeout(() => setConfetti([]), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
          }}
        />
      ))}
    </>
  );
}

export default function WinnerDisplay({
  winners,
  substitutes,
  onReset,
}: WinnerDisplayProps) {
  return (
    <div className="space-y-6">
      <Confetti />

      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg trophy-bounce">
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"
              clipRule="evenodd"
            />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
          🎉 Tebrikler! 🎉
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {winners.length} kazanan belirlendi
        </p>
      </div>

      {/* Winners List */}
      <div className="space-y-4">
        {winners.map((winner, index) => (
          <div
            key={winner.position}
            className="winner-card p-5 rounded-2xl border-2 transition-all hover:scale-[1.02]"
            style={{
              animationDelay: `${index * 0.1}s`,
              borderColor:
                index === 0
                  ? "#ffd700"
                  : index === 1
                    ? "#c0c0c0"
                    : index === 2
                      ? "#cd7f32"
                      : "var(--card-border)",
              background:
                index === 0
                  ? "linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))"
                  : index === 1
                    ? "linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.05))"
                    : index === 2
                      ? "linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.05))"
                      : "var(--card-bg)",
            }}
          >
            <div className="flex items-center gap-4">
              {/* Position Badge */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-lg"
                style={{
                  background:
                    index === 0
                      ? "linear-gradient(135deg, #ffd700, #ffb700)"
                      : index === 1
                        ? "linear-gradient(135deg, #c0c0c0, #a8a8a8)"
                        : index === 2
                          ? "linear-gradient(135deg, #cd7f32, #b87333)"
                          : "linear-gradient(135deg, #dc2743, #bc1888)",
                }}
              >
                {winner.position}
              </div>

              {/* Winner Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg truncate">
                    @{winner.username}
                  </span>
                  {index < 3 && (
                    <span className="text-xl">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {winner.comment}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {winner.mentionCount} kişi etiketledi
                </div>
              </div>

              {/* Instagram Link */}
              <a
                href={`https://instagram.com/${winner.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white hover:scale-110 transition-transform"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {substitutes && substitutes.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-500 to-gray-700 bg-clip-text text-transparent text-center">
            yedek kazananlar
          </h3>
          <div className="space-y-3">
            {substitutes.map((sub, index) => (
              <div
                key={sub.position}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-700 dark:text-gray-300 truncate">
                    @{sub.username}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {sub.comment}
                  </div>
                </div>
                <a
                  href={`https://instagram.com/${sub.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 hover:text-pink-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Yeni Çekiliş
        </button>
        <button
          onClick={() => {
            const text = winners
              .map((w) => `${w.position}. @${w.username}`)
              .join("\n");
            navigator.clipboard.writeText(text);
          }}
          className="flex-1 btn-instagram flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          Sonuçları Kopyala
        </button>
      </div>
    </div>
  );
}
