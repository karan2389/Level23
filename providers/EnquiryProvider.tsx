"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Office } from "@/types/unit";

type EnquiryMode = "general" | "floor-plan";

interface EnquiryContextType {
  isOpen: boolean;
  mode: EnquiryMode;
  source: string;
  selectedFloor: number | null;
  selectedOffices: Office[];
  openEnquiry: (source: string, mode?: EnquiryMode, payload?: { floor: number | null, offices: Office[] }) => void;
  closeEnquiry: () => void;
}

const EnquiryContext = createContext<EnquiryContextType | undefined>(undefined);

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<EnquiryMode>("general");
  const [source, setSource] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedOffices, setSelectedOffices] = useState<Office[]>([]);

  const openEnquiry = useCallback((newSource: string, newMode: EnquiryMode = "general", payload?: { floor: number | null, offices: Office[] }) => {
    console.log(`[Analytics] enquiry_opened | source: ${newSource} | mode: ${newMode}`);
    setSource(newSource);
    setMode(newMode);
    if (payload) {
      setSelectedFloor(payload.floor);
      setSelectedOffices(payload.offices);
    }
    setIsOpen(true);
  }, []);

  const closeEnquiry = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <EnquiryContext.Provider
      value={{
        isOpen,
        mode,
        source,
        selectedFloor,
        selectedOffices,
        openEnquiry,
        closeEnquiry,
      }}
    >
      {children}
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  const context = useContext(EnquiryContext);
  if (context === undefined) {
    throw new Error("useEnquiry must be used within an EnquiryProvider");
  }
  return context;
}
