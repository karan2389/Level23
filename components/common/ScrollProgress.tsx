"use client";

import { useEffect, useState } from "react";
import { SECTION_IDS, SECTION_LABELS, type SectionId } from "@/utils/scrollConfig";
import { lenisScrollTo } from "@/hooks/useLenis";
import { getCurrentSectionIndex } from "@/utils/scrollNavigation";

export function ScrollProgress() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let frameId: number;
    const checkScroll = () => {
      setActiveIndex(getCurrentSectionIndex());
      
      // On mobile, hide when we reach the last section so it doesn't block the footer
      if (window.innerWidth < 768) {
        const lastSection = document.getElementById(SECTION_IDS[SECTION_IDS.length - 1]);
        if (lastSection) {
          const rect = lastSection.getBoundingClientRect();
          setIsVisible(rect.top > window.innerHeight * 0.5);
        }
      } else {
        setIsVisible(true);
      }
      
      frameId = requestAnimationFrame(checkScroll);
    };
    
    frameId = requestAnimationFrame(checkScroll);
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="scroll-progress">
      <div className="scroll-progress-line" />
      {SECTION_IDS.map((id, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={id}
            type="button"
            className={`scroll-progress-dot ${isActive ? "active" : ""}`}
            onClick={() => lenisScrollTo(id)}
            aria-label={`Scroll to ${SECTION_LABELS[id as SectionId]}`}
            aria-current={isActive ? "step" : undefined}
          >
            <span className="scroll-progress-tooltip">
              {SECTION_LABELS[id as SectionId]}
            </span>
            <span className="scroll-progress-circle" />
          </button>
        );
      })}
    </div>
  );
}
