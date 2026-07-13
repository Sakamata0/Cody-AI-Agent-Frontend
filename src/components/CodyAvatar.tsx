"use client";

import { useState, useEffect } from "react";

interface CodyAvatarProps {
  className?: string;
  animate?: boolean;
  showAura?: boolean;
}

export default function CodyAvatar({ className = "w-12 h-12", animate = false, showAura = false }: CodyAvatarProps) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!animate) return;

    function scheduleBlink() {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        setBlinking(true);
        setTimeout(() => {
          setBlinking(false);
          timerRef = scheduleBlink();
        }, 400);
      }, delay);
    }

    let timerRef = scheduleBlink();
    return () => clearTimeout(timerRef);
  }, [animate]);

  return (
    <div className={`relative ${className}`}>
      {/* Pulsing aura — only when thinking */}
      {showAura && (
        <div className="absolute inset-[15%] animate-cody-pulse rounded-[22%]" />
      )}
      {/* Avatar image */}
      <img
        src={blinking ? "/cody-blink.png" : "/cody.png"}
        alt="Cody"
        className="w-full h-full relative z-[1]"
      />
    </div>
  );
}
