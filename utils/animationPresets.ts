/**
 * animationPresets.ts
 *
 * Reusable GSAP tween factory functions.
 * Import from here so animation style stays consistent across sections.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REVEAL_CONFIG, PARALLAX_CONFIG } from "./scrollConfig";

/**
 * Reveal a set of elements as they scroll into view.
 * Staggers children if `stagger` is provided.
 */
export function revealFrom(
  targets: string | HTMLElement | HTMLElement[],
  options: {
    trigger?: string | HTMLElement;
    y?: number;
    x?: number;
    stagger?: number;
    delay?: number;
    duration?: number;
    once?: boolean;
    start?: string;
  } = {}
) {
  const {
    trigger,
    y = REVEAL_CONFIG.yOffset,
    x = 0,
    stagger = 0,
    delay = 0,
    duration = REVEAL_CONFIG.duration,
    once = true,
    start = "top 84%",
  } = options;

  return gsap.from(targets, {
    opacity: 0,
    y,
    x,
    duration,
    ease: REVEAL_CONFIG.ease,
    stagger,
    delay,
    clearProps: once ? "all" : undefined,
    scrollTrigger: {
      trigger: trigger ?? (typeof targets === "string" ? targets : undefined),
      start,
      toggleActions: once
        ? "play none none none"
        : "play none none reverse",
    },
  });
}

/**
 * Staggered reveal for a list of child elements inside a container.
 */
export function revealStaggered(
  containerTrigger: string | HTMLElement,
  childSelector: string,
  options: {
    stagger?: number;
    y?: number;
    start?: string;
  } = {}
) {
  const { stagger = REVEAL_CONFIG.stagger, y = REVEAL_CONFIG.yOffset, start = "top 82%" } = options;

  return gsap.from(`${typeof containerTrigger === "string" ? containerTrigger : ""} ${childSelector}`, {
    opacity: 0,
    y,
    duration: REVEAL_CONFIG.duration,
    ease: REVEAL_CONFIG.ease,
    stagger,
    scrollTrigger: {
      trigger: containerTrigger,
      start,
      toggleActions: "play none none none",
    },
  });
}

/**
 * Subtle image scale reveal (scale from 1.05 → 1.0 as it enters).
 */
export function imageScaleReveal(
  target: string | HTMLElement,
  trigger?: string | HTMLElement
) {
  return gsap.from(target, {
    scale: 1.06,
    opacity: 0,
    duration: 1.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: trigger ?? target,
      start: "top 88%",
      toggleActions: "play none none none",
    },
  });
}

/**
 * Scrubbed parallax on a background element.
 */
export function parallaxElement(
  target: string | HTMLElement,
  trigger: string | HTMLElement,
  speed: number = 0.08
) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  if (reducedMotion || isMobile) return null;

  return gsap.to(target, {
    yPercent: speed * -100,
    ease: "none",
    scrollTrigger: {
      trigger,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}
