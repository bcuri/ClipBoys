"use client";
import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import MagicBentoBorder from "./MagicBentoBorder";

interface CarouselProps { items: JSX.Element[]; initialScroll?: number; }
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 * index, ease: "easeOut", once: true } }} key={"card"+index} className="flex-shrink-0 rounded-3xl last:pr-[5%] md:last:pr-[33%]">
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
  useOutsideClick(containerRef, () => handleClose());
  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); onCardClose(index); };

  // Inline looped clip inside the card using YouTube Iframe API (muted by default)
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

    let loopTimer: any;
    let disposed = false;
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
          autoplay: 1,
          controls: 0,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          mute: 1,
        },
        events: {
          onReady: (e: any) => {
            e.target.mute();
            e.target.setLoop(false);
            e.target.setVolume(0);
            e.target.playVideo();
            playerReadyRef.current = true;
            loopTimer = setInterval(() => {
              try {
                const t = e.target.getCurrentTime();
                if (t >= (card.endSec! - 0.2)) {
                  e.target.seekTo(card.startSec!, true);
                }
              } catch {}
            }, 250);
          },
        },
      });
    });

    return () => {
      disposed = true;
      if (loopTimer) clearInterval(loopTimer);
      try { ytPlayerRef.current && ytPlayerRef.current.destroy && ytPlayerRef.current.destroy(); } catch {}
    };
  }, [card.videoId, card.startSec, card.endSec]);

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
          <div ref={inlinePlayerRef} className="h-full w-full" />
          {/* On hover: restart from start and unmute; on leave: mute */}
          <div
            className="absolute inset-0"
            onMouseEnter={(e)=>{
              e.stopPropagation();
              try {
                if (ytPlayerRef.current && playerReadyRef.current) {
                  const start = Math.max(0, Math.floor((card.startSec||0)));
                  ytPlayerRef.current.pauseVideo && ytPlayerRef.current.pauseVideo();
                  ytPlayerRef.current.seekTo(start, true);
                  ytPlayerRef.current.unMute && ytPlayerRef.current.unMute();
                  ytPlayerRef.current.setVolume && ytPlayerRef.current.setVolume(100);
                  ytPlayerRef.current.playVideo && ytPlayerRef.current.playVideo();
                }
              } catch {}
            }}
            onMouseLeave={(e)=>{
              e.stopPropagation();
              try {
                if (ytPlayerRef.current && playerReadyRef.current) {
                  ytPlayerRef.current.mute && ytPlayerRef.current.mute();
                  ytPlayerRef.current.setVolume && ytPlayerRef.current.setVolume(0);
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


