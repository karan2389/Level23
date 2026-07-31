"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";

interface OverlayHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose: () => void;
}

export function OverlayHeader({ title, subtitle, onBack, onClose }: OverlayHeaderProps) {
  return (
    <header className="premium-overlay-header">
      <div className="premium-overlay-header-left">
        {onBack && (
          <button 
            type="button" 
            className="premium-overlay-btn" 
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span className="sr-only">Back</span>
          </button>
        )}
      </div>
      
      <div className="premium-overlay-header-center">
        <h2 className="premium-overlay-title">{title}</h2>
        {subtitle && <p className="premium-overlay-subtitle">{subtitle}</p>}
      </div>
      
      <div className="premium-overlay-header-right">
        <button 
          type="button" 
          className="premium-overlay-btn" 
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </header>
  );
}
