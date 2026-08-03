/**
 * scrollConfig.ts
 *
 * Single source of truth for all scroll and animation configuration.
 * Centralising here means future tuning is a one-file change.
 */



/** Ordered page section IDs — must match the HTML id attributes */
export const SECTION_IDS = [
  "hero",
  "explorer",
  "floor-plan",
  "interiors",
  "location",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Section human-readable labels used in ScrollProgress */
export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Hero",
  explorer: "Building",
  "floor-plan": "Floor Plans",
  interiors: "Interiors",
  location: "Location",
  contact: "Contact",
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
