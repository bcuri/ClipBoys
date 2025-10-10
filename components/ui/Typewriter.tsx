"use client";

import React from "react";

type TypewriterProps = {
  text: string;
  speedMs?: number;
  className?: string;
  /**
   * Changing this value will retrigger the typing animation
   */
  replayKey?: string | number;
  style?: React.CSSProperties;
};

export default function Typewriter({ text, speedMs = 35, className, replayKey, style }: TypewriterProps) {
  const [display, setDisplay] = React.useState("");

  React.useEffect(() => {
    setDisplay("");
    if (!text) return;

    let i = 0;
    let lastTime = 0;
    const interval = Math.max(10, speedMs);
    
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= interval) {
        i += 1;
        setDisplay(text.slice(0, i));
        lastTime = currentTime;
        
        if (i < text.length) {
          requestAnimationFrame(animate);
        }
      } else {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [text, speedMs, replayKey]);

  return (
    <span className={className} style={style} aria-live="polite" aria-atomic="true">
      {display}
      <span className="inline-block w-[1ch] animate-pulse">|</span>
    </span>
  );
}


