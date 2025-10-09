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

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
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
  const [playerReady, setPlayerReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load YouTube API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    };

    const initializePlayer = () => {
      if (!containerRef.current || playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          start: start,
          end: end,
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          disablekb: 1,
          mute: 1, // Start muted
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setPlayerReady(true);
            setIsLoaded(true);
            // Ensure it starts at the beginning and is muted
            event.target.seekTo(start, true);
            event.target.mute();
            event.target.pauseVideo();
          },
          onStateChange: (event: any) => {
            // Handle video end - loop back to start
            if (event.data === window.YT.PlayerState.ENDED) {
              event.target.seekTo(start, true);
              event.target.pauseVideo();
            }
          },
        },
      });
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, start, end]);

  // Handle hover enter - smooth unmute and play
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (playerReady && playerRef.current) {
      try {
        playerRef.current.unMute();
        playerRef.current.seekTo(start, true);
        playerRef.current.playVideo();
      } catch (error) {
        console.log('Player not ready yet');
      }
    }
  };

  // Handle hover leave - smooth mute and pause
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (playerReady && playerRef.current) {
      try {
        playerRef.current.mute();
        playerRef.current.pauseVideo();
        playerRef.current.seekTo(start, true);
      } catch (error) {
        console.log('Player not ready yet');
      }
    }
  };

  return (
    <div 
      className={`relative w-full group cursor-pointer rounded-xl overflow-hidden ${className}`}
      style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* YouTube Player Container */}
      <div 
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full rounded-xl"
      />
      
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
      )}
      
      {/* Hover overlay indicator */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-20">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
          <Play className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
