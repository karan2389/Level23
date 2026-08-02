"use client";

/**
 * useLenis.ts
 *
 * Initialises Lenis smooth scrolling and wires it to GSAP ScrollTrigger.
 * - Exposes a module-level lenis instance so scrollNavigation.ts can drive it.
 * - Pauses Lenis when modals/overlays are open.
 * - Implements soft magnetic section alignment.
 * - Respects prefers-reduced-motion.
 */

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  LENIS_CONFIG,
  SECTION_IDS,
  MAGNET_THRESHOLD,
  MAGNET_DURATION,
} from "@/utils/scrollConfig";

/** Module-level singleton — exported so scrollNavigation can use it */
let lenisInstance: Lenis | null = null;

/** True while a magnet animation is in progress — prevents re-firing */
const magnetActive = new Set<string>();

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Scroll to a section ID using the Lenis instance if available,
 * falling back to native smooth scrollIntoView.
 */
export function lenisScrollTo(id: string, duration = 1.1): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { duration, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function useLenis({ modalOpen }: { modalOpen: boolean }): void {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis(
      prefersReduced
        ? { ...LENIS_CONFIG, lerp: 1, duration: 0 } // instant for reduced-motion
        : LENIS_CONFIG
    );

    lenisInstance = lenis;

    // ── Tie Lenis RAF to GSAP ticker (single RAF loop) ─────────────────
    lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ── Soft Magnetic Alignment ──────────────────────────────────────────
    // When the user naturally scrolls to >=MAGNET_THRESHOLD of a section's
    // visible area, gently nudge them to exact section top alignment.
    if (!prefersReduced) {
      lenis.on("scroll", ({ scroll }: { scroll: number }) => {
        for (const id of SECTION_IDS) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (magnetActive.has(id)) continue;

          const rect = el.getBoundingClientRect();
          const sectionHeight = el.offsetHeight;
          const visible = -rect.top; // how far we've scrolled into the section

          // Only trigger if we've passed the threshold into the section
          // and the section top is close to but not yet at viewport top
          if (
            visible > 0 &&
            visible < sectionHeight * 0.08 &&
            Math.abs(rect.top) < sectionHeight * (1 - MAGNET_THRESHOLD) &&
            Math.abs(rect.top) > 2
          ) {
            magnetActive.add(id);
            lenis.scrollTo(el, {
              duration: MAGNET_DURATION,
              easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            });
            // Reset after animation completes
            setTimeout(() => magnetActive.delete(id), MAGNET_DURATION * 1000 + 200);
          }
        }
      });
    }

    // ── Refresh ScrollTrigger on window resize ───────────────────────────
    const onResize = () => {
      setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      window.removeEventListener("resize", onResize);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []); // initialise once

  // ── Pause/resume on modal state ──────────────────────────────────────
  useEffect(() => {
    if (!lenisInstance) return;
    if (modalOpen) {
      lenisInstance.stop();
    } else {
      lenisInstance.start();
    }
  }, [modalOpen]);
}
