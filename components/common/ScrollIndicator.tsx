"use client";

/**
 * ScrollIndicator.tsx
 *
 * Reusable premium scroll-down indicator.
 * - Appears at the bottom-center of the viewport, fixed position.
 * - Fades out smoothly when the user begins scrolling within a section.
 * - Clicking/tapping scrolls to the next section via GSAP.
 * - Passes visibility control via `visible` prop (driven by useSectionSnap or IntersectionObserver).
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { scrollToSectionById } from "@/utils/scrollNavigation";

interface ScrollIndicatorProps {
  /** ID of the next section to scroll to when clicked. */
  nextSectionId: string;
  /** Label shown above the icon. */
  label?: string;
  /** Sub-label shown below the icon circle. */
  subLabel?: string;
  /** Whether the indicator should currently be visible. */
  visible: boolean;
  /** Direction of the chevron icon (defaults to "down"). */
  direction?: "up" | "down";
}

export function ScrollIndicator({
  nextSectionId,
  label = "Scroll Down",
  subLabel = "Scroll to Explore",
  visible,
  direction = "down",
}: ScrollIndicatorProps) {
  const handleClick = () => {
    scrollToSectionById(nextSectionId);
  };

  return (
    <button
      type="button"
      className={`scroll-indicator${visible ? " scroll-indicator--visible" : ""}`}
      onClick={handleClick}
      aria-label={`Scroll to next section: ${nextSectionId}`}
    >
      <span className="scroll-indicator__label">{label}</span>
      <span className="scroll-indicator__circle">
        {direction === "up" ? <ChevronUp size={22} strokeWidth={2} /> : <ChevronDown size={22} strokeWidth={2} />}
      </span>
      <span className="scroll-indicator__sub">{subLabel}</span>
    </button>
  );
}

/**
 * Hook that returns `true` when the indicator should be visible.
 * Hides after the user scrolls more than `hideThreshold` px past the
 * section top, and reappears when the section re-enters the viewport.
 */
export function useScrollIndicatorVisible(
  sectionId: string,
  hideThreshold = 80
): boolean {
  const [visible, setVisible] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const check = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const scrolledInto = window.scrollY - sectionTop;

      // Visible: section is close to the top of viewport and user hasn't scrolled far in
      const isNearTop = rect.top > -hideThreshold && rect.top < window.innerHeight * 0.5;
      setVisible(isNearTop && scrolledInto < hideThreshold);
    };

    const onScroll = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(check);
    };

    // Initial check
    check();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [sectionId, hideThreshold]);

  return visible;
}
