"use client";

import { useState } from "react";

interface LotteryFormProps {
  onDraw: (
    link: string,
    mentionCount: number,
    winnerCount: number,
    substituteCount: number,
  ) => void;
  onManualDraw: (
    usernames: string[],
    winnerCount: number,
    substituteCount: number,
  ) => void;
  isLoading: boolean;
}

export default function LotteryForm({
  onDraw,
  onManualDraw,
  isLoading,
}: LotteryFormProps) {
  const [mode, setMode] = useState<"auto" | "manual">("manual");
  const [link, setLink] = useState("");
  const [mentionCount, setMentionCount] = useState(1);
  const [winnerCount, setWinnerCount] = useState(1);
  const [substituteCount, setSubstituteCount] = useState(0);
  const [manualInput, setManualInput] = useState("");
  const [errors, setErrors] = useState<{
    link?: string;
    mention?: string;
    winner?: string;
    substitute?: string;
    manual?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      link?: string;
      mention?: string;
      winner?: string;
      substitute?: string;
      manual?: string;
    } = {};

    if (mode === "auto") {
      if (!link.trim()) {
        newErrors.link = "Instagram linki gerekli";
      } else if (!link.includes("instagram.com")) {
        newErrors.link = "Geçerli bir Instagram linki girin";
      }

      if (mentionCount < 1 || mentionCount > 10) {
        newErrors.mention = "Mention sayısı 1-10 arasında olmalı";
      }
    } else {
      const usernames = manualInput
        .split("\n")
        .map((u) => u.trim().replace("@", ""))
        .filter((u) => u.length > 0);

      if (usernames.length === 0) {
        newErrors.manual = "En az bir kullanıcı adı girin";
      } else if (usernames.length < winnerCount + substituteCount) {
        newErrors.manual = `En az ${winnerCount + substituteCount} kullanıcı gerekli (${usernames.length} girildi)`;
      }
    }

    if (winnerCount < 1 || winnerCount > 100) {
      newErrors.winner = "Kazanan sayısı 1-100 arasında olmalı";
    }

    if (substituteCount < 0 || substituteCount > 100) {
      newErrors.substitute = "Yedek sayısı 0-100 arasında olmalı";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (mode === "auto") {
        onDraw(link, mentionCount, winnerCount, substituteCount);
      } else {
        const usernames = manualInput
          .split("\n")
          .map((u) => u.trim().replace("@", ""))
          .filter((u) => u.length > 0);
        onManualDraw(usernames, winnerCount, substituteCount);
      }
    }
  };

  const usernameCount = manualInput
    .split("\n")
    .map((u) => u.trim().replace("@", ""))
    .filter((u) => u.length > 0).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Selector */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
            mode === "manual"
              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          📝 Manuel Giriş
        </button>
        <button
          type="button"
          onClick={() => setMode("auto")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
            mode === "auto"
              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          🔗 Otomatik (API)
        </button>
      </div>

      {mode === "manual" ? (
        /* Manual Input Mode */
        <div className="space-y-2">
          <label
            htmlFor="manualInput"
            className="flex items-center gap-2 text-sm font-medium"
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Katılımcı Listesi
            {usernameCount > 0 && (
              <span className="ml-auto text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full">
                {usernameCount} kişi
              </span>
            )}
          </label>
          <textarea
            id="manualInput"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Her satıra bir kullanıcı adı yazın:&#10;kullanici1&#10;kullanici2&#10;@kullanici3"
            rows={8}
            className={`input-field resize-none font-mono text-sm ${errors.manual ? "border-red-500 focus:border-red-500" : ""}`}
          />
          <p className="text-xs text-gray-500">
            Instagram yorumlarından kullanıcı adlarını kopyalayıp yapıştırın.
            Her satır bir katılımcı.
          </p>
          {errors.manual && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.manual}
            </p>
          )}
        </div>
      ) : (
        /* Auto Mode - Instagram Link */
        <>
          <div className="space-y-2">
            <label
              htmlFor="link"
              className="flex items-center gap-2 text-sm font-medium"
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Instagram Gönderi Linki
            </label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.instagram.com/p/..."
              className={`input-field ${errors.link ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {errors.link && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.link}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="mentionCount"
              className="flex items-center gap-2 text-sm font-medium"
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
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
              Minimum Etiket (Mention) Sayısı
            </label>
            <div className="relative">
              <input
                type="number"
                id="mentionCount"
                value={mentionCount}
                onChange={(e) => setMentionCount(parseInt(e.target.value) || 1)}
                min={1}
                max={10}
                className={`input-field ${errors.mention ? "border-red-500 focus:border-red-500" : ""}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                kişi
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Yorumlarda en az bu kadar kişi etiketlemiş olmalı
            </p>
            {errors.mention && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.mention}
              </p>
            )}
          </div>
        </>
      )}

      {/* Winner Count Input */}
      <div className="space-y-2">
        <label
          htmlFor="winnerCount"
          className="flex items-center gap-2 text-sm font-medium"
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Kazanan Sayısı
        </label>
        <div className="relative">
          <input
            type="number"
            id="winnerCount"
            value={winnerCount}
            onChange={(e) => setWinnerCount(parseInt(e.target.value) || 1)}
            min={1}
            max={100}
            className={`input-field ${errors.winner ? "border-red-500 focus:border-red-500" : ""}`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            kişi
          </span>
        </div>
        {errors.winner && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.winner}
          </p>
        )}
      </div>

      {/* Substitute Winner Count Input */}
      <div className="space-y-2">
        <label
          htmlFor="substituteCount"
          className="flex items-center gap-2 text-sm font-medium"
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Yedek Kazanan Sayısı
        </label>
        <div className="relative">
          <input
            type="number"
            id="substituteCount"
            value={substituteCount}
            onChange={(e) => setSubstituteCount(parseInt(e.target.value) || 0)}
            min={0}
            max={100}
            className={`input-field ${errors.substitute ? "border-red-500 focus:border-red-500" : ""}`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            kişi
          </span>
        </div>
        {errors.substitute && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.substitute}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-instagram w-full flex items-center justify-center gap-3 text-lg"
      >
        {isLoading ? (
          <>
            <div className="spinner"></div>
            Çekiliş Yapılıyor...
          </>
        ) : (
          <>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Çekilişi Başlat
          </>
        )}
      </button>
    </form>
  );
}
