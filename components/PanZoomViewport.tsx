"use client";

import { Maximize2, Minus, Plus } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type TransformState = {
  scale: number;
  x: number;
  y: number;
};

type Point = { x: number; y: number };

type PanZoomViewportProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  minScale?: number;
  maxScale?: number;
  ariaLabel?: string;
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export default function PanZoomViewport({
  children,
  className = "",
  contentClassName = "",
  minScale = 1,
  maxScale = 4,
  ariaLabel = "Interactive zoomable plan",
}: PanZoomViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const panStart = useRef<{ point: Point; transform: TransformState } | null>(null);
  const pinchStart = useRef<{
    distance: number;
    midpoint: Point;
    transform: TransformState;
  } | null>(null);
  const transformRef = useRef<TransformState>({ scale: minScale, x: 0, y: 0 });
  const [transform, setTransform] = useState<TransformState>({ scale: minScale, x: 0, y: 0 });

  const constrain = useCallback((next: TransformState): TransformState => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return next;

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const scaledWidth = content.offsetWidth * next.scale;
    const scaledHeight = content.offsetHeight * next.scale;

    const minX = scaledWidth <= viewportWidth ? (viewportWidth - scaledWidth) / 2 : viewportWidth - scaledWidth;
    const maxX = scaledWidth <= viewportWidth ? minX : 0;
    const minY = scaledHeight <= viewportHeight ? (viewportHeight - scaledHeight) / 2 : viewportHeight - scaledHeight;
    const maxY = scaledHeight <= viewportHeight ? minY : 0;

    return {
      scale: next.scale,
      x: clamp(next.x, minX, maxX),
      y: clamp(next.y, minY, maxY),
    };
  }, []);

  const applyTransform = useCallback((next: TransformState) => {
    const constrained = constrain(next);
    transformRef.current = constrained;
    setTransform(constrained);
  }, [constrain]);

  const reset = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const x = Math.max(0, (viewport.clientWidth - content.offsetWidth * minScale) / 2);
    const y = Math.max(0, (viewport.clientHeight - content.offsetHeight * minScale) / 2);
    applyTransform({ scale: minScale, x, y });
  }, [applyTransform, minScale]);

  const zoomAt = useCallback((nextScale: number, clientPoint?: Point) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const current = transformRef.current;
    const scale = clamp(nextScale, minScale, maxScale);
    const rect = viewport.getBoundingClientRect();
    const focus = clientPoint
      ? { x: clientPoint.x - rect.left, y: clientPoint.y - rect.top }
      : { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };

    const contentX = (focus.x - current.x) / current.scale;
    const contentY = (focus.y - current.y) / current.scale;
    applyTransform({
      scale,
      x: focus.x - contentX * scale,
      y: focus.y - contentY * scale,
    });
  }, [applyTransform, maxScale, minScale]);

  useLayoutEffect(() => {
    reset();
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const observer = new ResizeObserver(reset);
    observer.observe(viewport);
    observer.observe(content);
    return () => observer.disconnect();
  }, [reset]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const multiplier = event.deltaY < 0 ? 1.12 : 0.9;
      zoomAt(transformRef.current.scale * multiplier, { x: event.clientX, y: event.clientY });
    };
    const preventBrowserGesture = (event: Event) => event.preventDefault();
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    viewport.addEventListener("gesturestart", preventBrowserGesture, { passive: false });
    viewport.addEventListener("gesturechange", preventBrowserGesture, { passive: false });
    viewport.addEventListener("gestureend", preventBrowserGesture, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("gesturestart", preventBrowserGesture);
      viewport.removeEventListener("gesturechange", preventBrowserGesture);
      viewport.removeEventListener("gestureend", preventBrowserGesture);
    };
  }, [zoomAt]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest(".office-hotspot") && pointers.current.size === 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const points = [...pointers.current.values()];
    if (points.length === 1) {
      panStart.current = { point: points[0], transform: transformRef.current };
      pinchStart.current = null;
    } else if (points.length === 2) {
      pinchStart.current = {
        distance: Math.max(1, distance(points[0], points[1])),
        midpoint: midpoint(points[0], points[1]),
        transform: transformRef.current,
      };
      panStart.current = null;
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    event.preventDefault();
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];

    if (points.length >= 2 && pinchStart.current) {
      const start = pinchStart.current;
      const currentMidpoint = midpoint(points[0], points[1]);
      const nextScale = clamp(
        start.transform.scale * (distance(points[0], points[1]) / start.distance),
        minScale,
        maxScale,
      );
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      const startFocus = { x: start.midpoint.x - rect.left, y: start.midpoint.y - rect.top };
      const currentFocus = { x: currentMidpoint.x - rect.left, y: currentMidpoint.y - rect.top };
      const contentX = (startFocus.x - start.transform.x) / start.transform.scale;
      const contentY = (startFocus.y - start.transform.y) / start.transform.scale;
      applyTransform({
        scale: nextScale,
        x: currentFocus.x - contentX * nextScale,
        y: currentFocus.y - contentY * nextScale,
      });
      return;
    }

    if (points.length === 1 && panStart.current) {
      const start = panStart.current;
      applyTransform({
        scale: start.transform.scale,
        x: start.transform.x + points[0].x - start.point.x,
        y: start.transform.y + points[0].y - start.point.y,
      });
    }
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    const points = [...pointers.current.values()];
    pinchStart.current = null;
    if (points.length === 1) {
      panStart.current = { point: points[0], transform: transformRef.current };
    } else {
      panStart.current = null;
    }
  };

  return (
    <div className={`panzoom-shell ${className}`}>
      <div className="plan-toolbar" aria-label="Plan zoom controls">
        <button type="button" onClick={() => zoomAt(transformRef.current.scale * 1.2)} aria-label="Zoom in"><Plus /></button>
        <span>{Math.round(transform.scale * 100)}%</span>
        <button type="button" onClick={() => zoomAt(transformRef.current.scale / 1.2)} aria-label="Zoom out"><Minus /></button>
        <button type="button" onClick={reset} aria-label="Reset zoom and position"><Maximize2 /></button>
      </div>
      <div
        ref={viewportRef}
        className="panzoom-viewport"
        role="region"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={reset}
      >
        <div
          ref={contentRef}
          className={`panzoom-content ${contentClassName}`}
          style={{ transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})` }}
        >
          {children}
        </div>
      </div>
      <div className="panzoom-hint">Drag to pan · pinch or scroll to zoom · double-tap to reset</div>
    </div>
  );
}
