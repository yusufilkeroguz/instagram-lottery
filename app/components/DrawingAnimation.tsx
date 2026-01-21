"use client";

import { useEffect, useState } from "react";

interface DrawingAnimationProps {
  participants: string[];
  onComplete: () => void;
}

export default function DrawingAnimation({
  participants,
  onComplete,
}: DrawingAnimationProps) {
  const [currentName, setCurrentName] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let nameIndex = 0;
    const duration = 3000; // 3 seconds
    const intervalTime = 50;
    const totalIterations = duration / intervalTime;
    let iteration = 0;

    const interval = setInterval(() => {
      iteration++;
      setProgress((iteration / totalIterations) * 100);

      // Slow down towards the end
      const slowdownFactor = Math.pow(iteration / totalIterations, 2);
      if (Math.random() > slowdownFactor * 0.8) {
        nameIndex = (nameIndex + 1) % participants.length;
        setCurrentName(participants[nameIndex]);
      }

      if (iteration >= totalIterations) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [participants, onComplete]);

  return (
    <div className="text-center space-y-8 py-8">
      {/* Animated Circle */}
      <div className="relative inline-flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute w-48 h-48 rounded-full border-4 border-pink-500/20"></div>

        {/* Progress Ring */}
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * progress) / 100}
            className="transition-all duration-100"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="25%" stopColor="#e6683c" />
              <stop offset="50%" stopColor="#dc2743" />
              <stop offset="75%" stopColor="#cc2366" />
              <stop offset="100%" stopColor="#bc1888" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="pulse-ring">
            <svg
              className="w-12 h-12 text-pink-500"
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
        </div>
      </div>

      {/* Current Name Display */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Seçiliyor...
        </p>
        <div className="h-16 flex items-center justify-center">
          <p
            className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent animate-pulse"
            key={currentName}
          >
            @{currentName || "..."}
          </p>
        </div>
      </div>

      {/* Progress Text */}
      <p className="text-sm text-gray-400">
        {Math.round(progress)}% tamamlandı
      </p>
    </div>
  );
}
