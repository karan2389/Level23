/**
 * useSectionSnap.ts
 *
 * Premium section-snap scrolling hook.
 * - Intercepts mouse wheel on desktop: one gesture = one section.
 * - Intercepts keyboard arrow/space: navigates one section at a time.
 * - On mobile: detects swipe direction on touchend and snaps to nearest section.
 * - Disabled when: modal/overlay is open OR prefers-reduced-motion is active.
 * - Never interferes with scroll events originating inside PanZoom viewports.
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  SECTION_IDS,
  getCurrentSectionIndex,
  scrollToSectionByIndex,
} from "@/utils/scrollNavigation";

/** Selectors for interactive inner-scroll containers that should be ignored. */
const INNER_SCROLL_SELECTORS = [
  ".panzoom-shell",
  ".panzoom-viewport",
  ".pan-zoom-viewport",
  ".typical-plan-panzoom",
  ".standard-plan-panzoom",
  "[data-panzoom]",
];

function isInsideInnerScroll(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return INNER_SCROLL_SELECTORS.some((sel) => target.closest(sel) !== null);
}

export function useSectionSnap({ modalOpen }: { modalOpen: boolean }): void {
  const isAnimating = useRef(false);
  const currentIndex = useRef(0);
  const touchStartY = useRef(0);

  /** Lock scroll snap for the given duration then unlock. */
  const lockFor = useCallback((ms: number) => {
    isAnimating.current = true;
    setTimeout(() => {
      isAnimating.current = false;
    }, ms);
  }, []);

  /** Snap to a specific section index. */
  const snapTo = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(SECTION_IDS.length - 1, nextIndex));
      currentIndex.current = clamped;
      scrollToSectionByIndex(clamped, 0.85, "power3.out");
      lockFor(950);
    },
    [lockFor]
  );

  /** Snap forward or backward by one. */
  const snapBy = useCallback(
    (delta: number) => {
      if (isAnimating.current) return;
      const base = getCurrentSectionIndex();
      snapTo(base + delta);
    },
    [snapTo]
  );

  useEffect(() => {
    // Check for reduced-motion preference
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return; // bail out — use native scroll

    // ── Wheel handler (desktop) ────────────────────────────────────────
    const handleWheel = (e: WheelEvent) => {
      if (modalOpen) return;
      if (isInsideInnerScroll(e.target)) return;

      const delta = e.deltaY;
      // Ignore very small movements (trackpad inertia noise)
      if (Math.abs(delta) < 5) return;

      e.preventDefault();
      snapBy(delta > 0 ? 1 : -1);
    };

    // ── Keyboard handler ───────────────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpen) return;
      // Don't hijack if user is in an input/select/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        snapBy(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        snapBy(-1);
      }
    };

    // ── Touch handlers (mobile) ─────────────────────────────────────────
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? 0;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (modalOpen) return;
      if (isInsideInnerScroll(e.target)) return;

      const endY = e.changedTouches[0]?.clientY ?? 0;
      const deltaY = touchStartY.current - endY;
      // Only snap for intentional swipes (>40px)
      if (Math.abs(deltaY) < 40) return;

      if (!isAnimating.current) {
        snapBy(deltaY > 0 ? 1 : -1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [modalOpen, snapBy]);
}
