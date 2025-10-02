import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

interface MagicBentoBorderProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
}

const MagicBentoBorder = ({
  children,
  className = '',
  style = {},
  glowColor = '50, 227, 63', // Default to brand green
  borderWidth = 2,
  borderRadius = 16,
  enableTilt = true,
  enableMagnetism = true
}: MagicBentoBorderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);

  const createBorderElement = useCallback(() => {
    if (!containerRef.current) return null;

    const border = document.createElement('div');
    border.style.cssText = `
      position: absolute;
      top: -${borderWidth}px;
      left: -${borderWidth}px;
      right: -${borderWidth}px;
      bottom: -${borderWidth}px;
      border-radius: ${borderRadius}px;
      background: linear-gradient(45deg, 
        rgba(102, 204, 255, 0.8) 0%, 
        rgba(34, 197, 94, 0.6) 25%, 
        rgba(6, 182, 212, 0.8) 50%, 
        rgba(34, 197, 94, 0.6) 75%, 
        rgba(102, 204, 255, 0.8) 100%
      );
      background-size: 400% 400%;
      opacity: 0;
      pointer-events: none;
      z-index: 1;
      filter: blur(1px);
      mask: linear-gradient(white, white) content-box, linear-gradient(white, white);
      mask-composite: exclude;
      -webkit-mask-composite: xor;
      padding: ${borderWidth}px;
    `;

    // Add animated background
    gsap.to(border, {
      backgroundPosition: '400% 400%',
      duration: 3,
      repeat: -1,
      ease: 'none'
    });

    return border;
  }, [borderWidth, borderRadius]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const border = createBorderElement();
    
    if (border) {
      container.appendChild(border);
      borderRef.current = border;
    }

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      
      if (border) {
        gsap.to(border, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
      
      if (enableTilt) {
        gsap.to(container, {
          rotateX: 2,
          rotateY: 2,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      
      if (border) {
        gsap.to(border, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableTilt) {
        gsap.to(container, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(container, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHoveredRef.current) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(container, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.02;
        const magnetY = (y - centerY) * 0.02;

        gsap.to(container, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
      
      if (border && border.parentNode) {
        border.parentNode.removeChild(border);
      }
    };
  }, [createBorderElement, enableTilt, enableMagnetism]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        ...style,
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
    </div>
  );
};

export default MagicBentoBorder;
