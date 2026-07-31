"use client";

import React from "react";

interface StickyActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyActionBar({ children, className = "" }: StickyActionBarProps) {
  return (
    <div className={`premium-overlay-action-bar ${className}`}>
      {children}
    </div>
  );
}
