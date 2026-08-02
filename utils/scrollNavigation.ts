/**
 * scrollNavigation.ts
 *
 * Utility for determining current section and scrolling to specific sections.
 * Powered by Lenis for ultra-smooth cinematic scrolling.
 */

import { lenisScrollTo } from "@/hooks/useLenis";
import { SECTION_IDS, type SectionId } from "./scrollConfig";

export { SECTION_IDS };
export type { SectionId };

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

/** Smoothly scrolls to a section by index. */
export function scrollToSectionByIndex(
  index: number,
  duration = 1.1
): void {
  const id = SECTION_IDS[index];
  if (!id) return;
  lenisScrollTo(id, duration);
}

/** Smoothly scrolls to a section by its string ID. */
export function scrollToSectionById(
  id: string,
  duration = 1.1
): void {
  lenisScrollTo(id, duration);
}

/** Given a section ID, returns the ID of the next section, or null if last. */
export function getNextSectionId(currentId: string): string | null {
  const idx = SECTION_IDS.indexOf(currentId as SectionId);
  if (idx === -1 || idx >= SECTION_IDS.length - 1) return null;
  return SECTION_IDS[idx + 1];
}
