/**
 * scrollConfig.ts
 *
 * Single source of truth for all scroll and animation configuration.
 * Centralising here means future tuning is a one-file change.
 */

/** Lenis smooth-scroll initialisation options */
export const LENIS_CONFIG = {
  /** Inertia / smoothing factor. 0.085 = premium, snappy but not laggy */
  lerp: 0.085,
  smoothWheel: true,
  /** Multiplier on touch scroll distance */
  touchMultiplier: 1.5,
  /** Prevent Lenis from creating its own RAF loop; we drive it via GSAP ticker */
  autoRaf: false,
} as const;

/** Ordered page section IDs — must match the HTML id attributes */
export const SECTION_IDS = [
  "hero",
  "explorer",
  "floor-plan",
  "interiors",
  "location",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Section human-readable labels used in ScrollProgress */
export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Hero",
  explorer: "Building",
  "floor-plan": "Floor Plans",
  interiors: "Interiors",
  location: "Location",
};

/** Reveal animation defaults */
export const REVEAL_CONFIG = {
  duration: 0.88,
  ease: "power3.out",
  yOffset: 44,
  stagger: 0.1,
} as const;

/** Parallax multipliers (fraction of scroll distance) */
export const PARALLAX_CONFIG = {
  heroBg: 0.14,     // hero background image
  heroWash: 0.06,   // hero colour overlay
  interiorBg: 0.04, // interiors slider
  mapCard: 0.03,    // location map
} as const;

/**
 * Magnetic alignment: if the user has scrolled to this fraction of a section's
 * height, gently nudge them to perfect alignment.
 * Set to 1 to disable.
 */
export const MAGNET_THRESHOLD = 0.92;
export const MAGNET_DURATION = 0.65;
