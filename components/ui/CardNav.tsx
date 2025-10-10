"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";

type NavLink = { label: string; href: string; ariaLabel?: string };
type NavItem = { label: string; bgColor?: string; textColor?: string; links?: NavLink[] };

interface CardNavProps {
  logo: string;
  logoAlt?: string;
  items: NavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export default function CardNav({
  logo,
  logoAlt = "Logo",
  items,
  className = "",
  ease = "power3.out",
  baseColor = "#0b0b0b",
  menuColor = "#fff",
  buttonBgColor = "#22c83c",
  buttonTextColor = "#000",
}: CardNavProps) {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector<HTMLElement>(".card-nav-content");
      if (contentEl) {
        const was = {
          visibility: contentEl.style.visibility,
          pointerEvents: contentEl.style.pointerEvents,
          position: contentEl.style.position,
          height: contentEl.style.height,
        };
        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";
        contentEl.offsetHeight;
        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;
        contentEl.style.visibility = was.visibility;
        contentEl.style.pointerEvents = was.pointerEvents;
        contentEl.style.position = was.position;
        contentEl.style.height = was.height;
        return topBar + contentHeight + padding;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, "-=0.1");
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) tlRef.current = newTl;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`w-full ${className}`}>
      <nav
        ref={navRef}
        className={`relative card-nav open:max-h-[80vh] mx-auto w-full max-w-5xl rounded-2xl overflow-hidden`}
        style={{
          // Murky liquid glass background
          background:
            "radial-gradient(1200px 300px at 10% -20%, rgba(102,204,255,0.06), transparent), radial-gradient(1200px 300px at 110% 120%, rgba(34,200,60,0.06), transparent), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        {/* Gradient border overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            padding: 1,
            background:
              "linear-gradient(120deg, rgba(102,204,255,0.45), rgba(6,182,212,0.35), rgba(34,200,60,0.45))",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude" as any,
          }}
        />
        {/* Subtle noise for murky texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.12]"
          style={{
            backgroundImage:
              "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\" viewBox=\"0 0 120 120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\" opacity=\"0.6\"/></svg>')",
            backgroundSize: "160px 160px",
          }}
        />
        <div className="card-nav-top flex items-center justify-between px-4 py-3">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""} cursor-pointer select-none`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            tabIndex={0}
            style={{ color: menuColor || "#fff" }}
          >
            <div className="hamburger-line h-0.5 w-6 rounded bg-current" />
            <div className="hamburger-line mt-1 h-0.5 w-6 rounded bg-current" />
          </div>

          <div className="logo-container">
            <img src={logo} alt={logoAlt} className="logo h-7 w-auto" />
          </div>

          <button
            type="button"
            className="card-nav-cta-button inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          >
            Get Started
          </button>
        </div>

        <div className="card-nav-content grid grid-cols-1 gap-3 px-4 pb-4 md:grid-cols-3" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card rounded-xl border border-white/10 p-4"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor || "#0b0b0b", color: item.textColor || "#fff" }}
            >
              <div className="nav-card-label mb-3 text-sm font-semibold opacity-90">{item.label}</div>
              <div className="nav-card-links flex flex-col gap-2">
                {item.links?.map((lnk, i) => (
                  <a key={`${lnk.label}-${i}`} className="nav-card-link inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100" href={lnk.href} aria-label={lnk.ariaLabel}>
                    <ArrowUpRight className="nav-card-link-icon h-4 w-4" aria-hidden="true" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}


