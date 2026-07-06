"use client";

import { useState, useEffect } from "react";

interface CodyAvatarProps {
  className?: string;
  animate?: boolean;
}

export default function CodyAvatar({ className = "w-12 h-12", animate = false }: CodyAvatarProps) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!animate) return;

    // Blink every 3-4 seconds (randomized for natural feel)
    function scheduleBlink() {
      const delay = 3000 + Math.random() * 2000; // 3-5 seconds
      return setTimeout(() => {
        setBlinking(true);
        // Blink duration: 500ms
        setTimeout(() => {
          setBlinking(false);
          timerRef = scheduleBlink();
        }, 500);
      }, delay);
    }

    let timerRef = scheduleBlink();
    return () => clearTimeout(timerRef);
  }, [animate]);

  return (
    <img
      src={blinking ? "/cody-blink.png" : "/cody.png"}
      alt="Cody"
      className={`${className} rounded-2xl`}
    />
  );
}
