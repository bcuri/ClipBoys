"use client";
import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import MagicBentoBorder from "./MagicBentoBorder";

interface CarouselProps { items: React.ReactElement[]; initialScroll?: number; }
type CardType = { src: string; title: string; category: string; content: React.ReactNode; videoUrl?: string; videoId?: string; startSec?: number; endSec?: number; };

export const CarouselContext = createContext<{ onCardClose: (index: number) => void; currentIndex: number; }>({ onCardClose: () => {}, currentIndex: 0 });

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  const scrollRight = () => carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384; const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" });
      setCurrentIndex(index);
    }
  };
  const isMobile = () => (typeof window !== "undefined" && window.innerWidth < 768);

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="relative w-full">
        <div className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20" ref={carouselRef} onScroll={checkScrollability}>
          <div className={cn("absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l")} />
          <div className={cn("flex flex-row justify-start gap-4 pl-4","mx-auto max-w-7xl")}>{items.map((item, index) => (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 * index, ease: "easeOut" } }} key={"card"+index} className="flex-shrink-0 rounded-3xl last:pr-[5%] md:last:pr-[33%]">
              {item}
            </motion.div>
          ))}</div>
        </div>
        <div className="mr-10 flex justify-end gap-2">
          <button className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50" onClick={scrollLeft} disabled={!canScrollLeft}><ChevronLeft className="h-6 w-6 text-gray-500" /></button>
          <button className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50" onClick={scrollRight} disabled={!canScrollRight}><ChevronRight className="h-6 w-6 text-gray-500" /></button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({ card, index, layout = false }: { card: CardType; index: number; layout?: boolean; }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);
  const inlinePlayerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const playerReadyRef = useRef<boolean>(false);
  const progressTimerRef = useRef<any>(null);
  const [progressPct, setProgressPct] = useState(0);
  const clipDuration = (card.endSec || 0) - (card.startSec || 0);
  const [inView, setInView] = useState(false);
  const [thumbVisible, setThumbVisible] = useState(true);
  
  const getEmbedUrl = (url?: string) => {
    if (!url) return undefined;
    try {
      const u = new URL(url);
      const v = u.searchParams.get("v") || u.pathname.split("/").pop();
      // extract start seconds either from t param or seconds at end
      let start = 0;
      const tParam = u.searchParams.get("t");
      if (tParam) {
        const match = tParam.match(/(\d+)/);
        if (match) start = parseInt(match[1] || "0", 10);
      }
      // Support youtu.be/{id}?t=...
      const isEmbed = u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
      if (!isEmbed || !v) return undefined;
      const base = `https://www.youtube.com/embed/${v}`;
      return `${base}?start=${start}&autoplay=1&rel=0&modestbranding=1`;
    } catch {
      return undefined;
    }
  };
  useEffect(() => { function onKeyDown(event: KeyboardEvent){ if(event.key === "Escape") handleClose(); }
    document.addEventListener("keydown", onKeyDown); return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  useOutsideClick(containerRef as React.RefObject<HTMLDivElement>, () => handleClose());
  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); onCardClose(index); };

  // Inline looped clip inside the card using YouTube Iframe API (muted by default)
  // Observe visibility to lazily mount/destroy player
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(entry.isIntersecting);
      },
      { rootMargin: "200px 0px", threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inlinePlayerRef.current || !card.videoId || !card.startSec || !card.endSec) return;

    const ensureApi = () => new Promise<void>((resolve) => {
      const w = window as any;
      if (w.YT && w.YT.Player) return resolve();
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => { prev && prev(); resolve(); };
      if (!document.getElementById("yt-iframe-api")) {
        const s = document.createElement("script");
        s.id = "yt-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(s);
      }
    });

    let localProgressTimer: any;
    let disposed = false;
    if (!inView) {
      // If out of view, tear down player to reduce resource usage
      try { ytPlayerRef.current && ytPlayerRef.current.destroy && ytPlayerRef.current.destroy(); } catch {}
      ytPlayerRef.current = null;
      playerReadyRef.current = false;
      setThumbVisible(true);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    ensureApi().then(() => {
      if (disposed) return;
      const w = window as any;
      ytPlayerRef.current = new w.YT.Player(inlinePlayerRef.current!, {
        videoId: card.videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          start: Math.max(0, Math.floor(card.startSec!)),
          end: Math.max(1, Math.floor(card.endSec!)),
          autoplay: 0,
          controls: 0,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          mute: 1,
          autohide: 1,
          iv_load_policy: 3,
          disablekb: 1,
        },
        events: {
          onReady: (e: any) => {
            e.target.mute();
            e.target.setLoop(false);
            e.target.setVolume(0);
            // Load video and pause at the clip start
            try {
              e.target.loadVideoById({
                videoId: card.videoId,
                startSeconds: card.startSec || 0,
                endSeconds: card.endSec || undefined,
                suggestedQuality: 'small',
              });
              // Ensure it's paused after loading
              setTimeout(() => {
                try {
                  e.target.pauseVideo();
                  e.target.seekTo(card.startSec || 0, true);
                } catch {}
              }, 100);
            } catch {}
            playerReadyRef.current = true;
            setThumbVisible(false);
            // Start at a lower quality to minimize initial buffering, then upgrade
            try { e.target.setPlaybackQuality && e.target.setPlaybackQuality('small'); } catch {}
            setTimeout(() => { try { e.target.setPlaybackQuality && e.target.setPlaybackQuality('medium'); } catch {} }, 1500);
            // Progress updater
            localProgressTimer = setInterval(() => {
              try {
                const state = e.target.getPlayerState && e.target.getPlayerState();
                const start = card.startSec || 0;
                if (state !== w.YT.PlayerState.PLAYING) {
                  // Keep progress at 0 when paused/cued
                  setProgressPct(0);
                  return;
                }
                const t = e.target.getCurrentTime();
                const dur = Math.max(0.001, (card.endSec || 0) - start);
                const pct = Math.min(100, Math.max(0, ((t - start) / dur) * 100));
                setProgressPct(pct);
                if (t >= (card.endSec! - 0.05)) {
                  // Stop at end and reset to start (paused)
                  e.target.pauseVideo();
                  e.target.seekTo(start, true);
                  setProgressPct(0);
                }
              } catch {}
            }, 100);
            progressTimerRef.current = localProgressTimer;
          },
          onStateChange: (ev: any) => {
            // If the player pauses for any reason, try to resume muted playback
            // We no longer auto-resume; default is paused until hover
          },
        },
      });
    });

    return () => {
      disposed = true;
      if (localProgressTimer) clearInterval(localProgressTimer);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      try { ytPlayerRef.current && ytPlayerRef.current.destroy && ytPlayerRef.current.destroy(); } catch {}
    };
  }, [card.videoId, card.startSec, card.endSec, inView]);

  return (<>
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 h-screen overflow-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} ref={containerRef} layoutId={layout ? `card-${card.title}` : undefined} className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white p-4 font-sans md:p-10 dark:bg-neutral-900">
            <button className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white" onClick={handleClose}><X className="h-6 w-6 text-neutral-100 dark:text-neutral-900"/></button>
            <motion.p layoutId={layout ? `category-${card.title}` : undefined} className="text-base font-medium text-black dark:text-white">{card.category}</motion.p>
            <motion.p layoutId={layout ? `title-${card.title}` : undefined} className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white">{card.title}</motion.p>
            {card.videoUrl && (
              <div className="mt-6 w-full">
                <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{paddingTop: "56.25%"}}>
                  <iframe
                    src={getEmbedUrl(card.videoUrl)}
                    className="absolute inset-0 h-full w-full"
                    title={card.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
            <div className="py-10">{card.content}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    <MagicBentoBorder
      className="rounded-3xl"
      glowColor="102, 204, 255"
      borderWidth={2}
      borderRadius={24}
      enableTilt={true}
      enableMagnetism={true}
    >
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="relative z-10 flex h-56 w-96 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-[22.5rem] md:w-[40rem] dark:bg-neutral-900 group"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        <div className="relative z-40 p-8">
          <motion.p layoutId={layout ? `category-${card.category}` : undefined} className="text-left font-sans text-sm font-medium text-white md:text-base">{card.category}</motion.p>
          <motion.p layoutId={layout ? `title-${card.title}` : undefined} className="mt-2 max-w-xs text-left font-sans text-xl font-semibold [text-wrap:balance] text-white md:text-3xl">{card.title}</motion.p>
        </div>
        {/* Inline looped video background */}
        <div className="absolute inset-0 z-10 h-full w-full bg-black">
          {/* Progress bar at top, within the box */}
          <div className="absolute left-0 top-0 h-1 w-full bg-white/10 z-30">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${progressPct}%` }} />
          </div>
          {/* Thumbnail placeholder to avoid blank while player mounts */}
          {thumbVisible && (
            <img
              src={`https://img.youtube.com/vi/${card.videoId}/hqdefault.jpg`}
              alt={card.title}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
          )}
          <div ref={inlinePlayerRef} className="h-full w-full" />
          {/* On hover: restart from start and unmute; on leave: mute */}
          <div
            className="absolute inset-0"
            onMouseEnter={(e)=>{
              e.stopPropagation();
              try {
                if (ytPlayerRef.current && playerReadyRef.current) {
                  const start = Math.max(0, Math.floor((card.startSec||0)));
                  // Unmute and play from clip start
                  ytPlayerRef.current.unMute && ytPlayerRef.current.unMute();
                  ytPlayerRef.current.setVolume && ytPlayerRef.current.setVolume(100);
                  ytPlayerRef.current.seekTo(start, true);
                  // Small delay to ensure seek completes before playing
                  setTimeout(() => {
                    try {
                      ytPlayerRef.current && ytPlayerRef.current.playVideo && ytPlayerRef.current.playVideo();
                    } catch {}
                  }, 50);
                }
              } catch {}
            }}
            onMouseLeave={(e)=>{
              e.stopPropagation();
              try {
                if (ytPlayerRef.current && playerReadyRef.current) {
                  // Pause, mute, and snap back to the clip start
                  const start = Math.max(0, Math.floor((card.startSec||0)));
                  ytPlayerRef.current.pauseVideo && ytPlayerRef.current.pauseVideo();
                  ytPlayerRef.current.mute && ytPlayerRef.current.mute();
                  ytPlayerRef.current.setVolume && ytPlayerRef.current.setVolume(0);
                  ytPlayerRef.current.seekTo(start, true);
                  setProgressPct(0);
                }
              } catch {}
            }}
          />
        </div>
        {/* Play Button Overlay */}
        {card.videoUrl && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}
      </motion.button>
    </MagicBentoBorder>
  </>);
};


