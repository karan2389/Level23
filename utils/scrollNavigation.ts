/**
 * scrollNavigation.ts
 *
 * Shared section order and GSAP-powered scroll utility.
 * Single source of truth for section IDs used by useSectionSnap and ScrollIndicator.
 */

import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/** Ordered list of section IDs on the page. */
export const SECTION_IDS = [
  "hero",
  "explorer",
  "floor-plan",
  "interiors",
  "location",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Returns the index of the section whose top is nearest the current scroll position. */
export function getCurrentSectionIndex(): number {
  const scrollY = window.scrollY;
  let closestIndex = 0;
  let closestDistance = Infinity;

  SECTION_IDS.forEach((id, index) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + scrollY;
    const dist = Math.abs(top - scrollY);
    if (dist < closestDistance) {
      closestDistance = dist;
      closestIndex = index;
    }
  });

  return closestIndex;
}

/** Smoothly scrolls to a section by index using GSAP ScrollToPlugin. */
export function scrollToSectionByIndex(
  index: number,
  duration = 0.85,
  ease = "power3.out"
): void {
  const id = SECTION_IDS[index];
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  const scrollY = window.scrollY;
  const target = el.getBoundingClientRect().top + scrollY;

  gsap.to(window, {
    scrollTo: { y: target, autoKill: false },
    duration,
    ease,
    overwrite: true,
  });
}

/** Smoothly scrolls to a section by its string ID. */
export function scrollToSectionById(
  id: string,
  duration = 0.85,
  ease = "power3.out"
): void {
  const el = document.getElementById(id);
  if (!el) return;
  const scrollY = window.scrollY;
  const target = el.getBoundingClientRect().top + scrollY;

  gsap.to(window, {
    scrollTo: { y: target, autoKill: false },
    duration,
    ease,
    overwrite: true,
  });
}

/** Given a section ID, returns the ID of the next section, or null if last. */
export function getNextSectionId(currentId: string): string | null {
  const idx = SECTION_IDS.indexOf(currentId as SectionId);
  if (idx === -1 || idx >= SECTION_IDS.length - 1) return null;
  return SECTION_IDS[idx + 1];
}
