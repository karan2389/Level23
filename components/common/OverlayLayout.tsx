"use client";

import React, { useEffect } from "react";

interface OverlayLayoutProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  zIndex?: number;
}

export function OverlayLayout({ children, onClose, className = "", zIndex = 125 }: OverlayLayoutProps) {
  useEffect(() => {
    // Lock body scroll when overlay is open
    document.body.style.overflow = "hidden";
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="premium-overlay-backdrop" 
      role="presentation" 
      onClick={onClose}
      style={{ zIndex }}
    >
      <article
        className={`premium-overlay-container ${className}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </article>
    </div>
  );
}
