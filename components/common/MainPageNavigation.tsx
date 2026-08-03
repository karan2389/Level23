"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SECTION_IDS } from "@/utils/scrollConfig";
import {
  getCurrentSectionIndex,
  scrollToSectionByIndex,
} from "@/utils/scrollNavigation";

const MOBILE_PAGE_QUERY = "(max-width: 900px)";
const GESTURE_BLOCK_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "[role='dialog']",
  ".panzoom-viewport",
  ".model-interaction-surface",
  ".premium-overlay-backdrop",
  ".nav-backdrop",
  ".multi-select-toolbar-relocated",
].join(",");

function gestureStartsOnInteractiveElement(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(GESTURE_BLOCK_SELECTOR));
}

export function MainPageNavigation({ disabled = false }: { disabled?: boolean }) {
  const [isMobilePaging, setIsMobilePaging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigationLock = useRef(false);

  const goToRelativePage = useCallback((direction: -1 | 1) => {
    if (navigationLock.current) return;

    const currentIndex = getCurrentSectionIndex();
    const nextIndex = Math.min(
      SECTION_IDS.length - 1,
      Math.max(0, currentIndex + direction),
    );

    if (nextIndex === currentIndex) return;

    navigationLock.current = true;
    setActiveIndex(nextIndex);
    scrollToSectionByIndex(nextIndex);

    window.setTimeout(() => {
      navigationLock.current = false;
    }, 720);
  }, []);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_PAGE_QUERY);
    const updateMode = () => setIsMobilePaging(media.matches);
    updateMode();
    media.addEventListener("change", updateMode);
    return () => media.removeEventListener("change", updateMode);
  }, []);

  useEffect(() => {
    if (!isMobilePaging) {
      document.documentElement.classList.remove("main-page-snap-enabled");
      document.body.classList.remove("main-page-snap-enabled");
      return;
    }

    document.documentElement.classList.add("main-page-snap-enabled");
    document.body.classList.add("main-page-snap-enabled");

    return () => {
      document.documentElement.classList.remove("main-page-snap-enabled");
      document.body.classList.remove("main-page-snap-enabled");
    };
  }, [isMobilePaging]);

  useEffect(() => {
    let frameId = 0;

    const updateActivePage = () => {
      frameId = 0;
      setActiveIndex(getCurrentSectionIndex());
    };

    const queueUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateActivePage);
    };

    updateActivePage();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!isMobilePaging || disabled) return;

    let startX: number | null = null;
    let startY: number | null = null;
    let canPage = false;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || gestureStartsOnInteractiveElement(event.target)) {
        canPage = false;
        return;
      }

      startX = touch.clientX;
      startY = touch.clientY;
      canPage = true;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!canPage || startX === null || startY === null) return;
      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!canPage || startX === null || startY === null) return;
      const touch = event.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const isVerticalSwipe = Math.abs(deltaY) >= 54 && Math.abs(deltaY) > Math.abs(deltaX) * 1.15;

      if (isVerticalSwipe) {
        goToRelativePage(deltaY < 0 ? 1 : -1);
      }

      startX = null;
      startY = null;
      canPage = false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (gestureStartsOnInteractiveElement(event.target) || Math.abs(event.deltaY) < 12) return;
      event.preventDefault();
      goToRelativePage(event.deltaY > 0 ? 1 : -1);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [disabled, goToRelativePage, isMobilePaging]);

  if (!isMobilePaging || disabled) return null;

  const hasPreviousPage = activeIndex > 0;
  const hasNextPage = activeIndex < SECTION_IDS.length - 1;

  return (
    <div className="main-page-navigation" aria-label="Page navigation">
      {hasPreviousPage && (
        <button
          type="button"
          className="main-page-navigation__control main-page-navigation__control--up"
          onClick={() => goToRelativePage(-1)}
          aria-label="Go to previous page"
        >
          <span></span>
          <span className="main-page-navigation__circle"><ChevronUp size={20} /></span>
          <small></small>
        </button>
      )}

      {hasNextPage && (
        <button
          type="button"
          className="main-page-navigation__control main-page-navigation__control--down"
          onClick={() => goToRelativePage(1)}
          aria-label="Go to next page"
        >
          <span>Swipe Up</span>
          <span className="main-page-navigation__circle"><ChevronDown size={20} /></span>
          <small>Go Down</small>
        </button>
      )}
    </div>
  );
}
