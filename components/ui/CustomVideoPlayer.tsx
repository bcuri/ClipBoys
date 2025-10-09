"use client";

import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";

interface CustomVideoPlayerProps {
  videoId: string;
  start: number;
  end: number;
  title: string;
  className?: string;
}

export default function CustomVideoPlayer({ 
  videoId, 
  start, 
  end, 
  title, 
  className = "" 
}: CustomVideoPlayerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Create the embed URL with proper parameters
  const getEmbedUrl = (muted: boolean = true) => {
    return `https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}&autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&mute=${muted ? '1' : '0'}&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
  };

  // Handle hover enter
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (iframeRef.current) {
      // Unmute the video
      iframeRef.current.src = getEmbedUrl(false);
    }
  };

  // Handle hover leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (iframeRef.current) {
      // Mute and reset to start
      iframeRef.current.src = getEmbedUrl(true);
    }
  };

  return (
    <div 
      className={`relative w-full group cursor-pointer rounded-xl overflow-hidden ${className}`}
      style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <iframe
        ref={iframeRef}
        className="absolute top-0 left-0 w-full h-full rounded-xl"
        src={getEmbedUrl(true)} // Start muted
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title}
        onLoad={() => setIsLoaded(true)}
      />
      
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
      )}
      
      {/* Hover overlay indicator */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
          <Play className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
