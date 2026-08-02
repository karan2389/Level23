"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/common/Header";
import { Layers } from "lucide-react";
import { HeroSection } from "@/components/hero/HeroSection";
import { BuildingScene } from "@/components/building/BuildingScene";
import { PlanViewer } from "@/components/unit/PlanViewer";
import { InteriorsSection } from "@/components/interiors/InteriorsSection";
import { LocationSection } from "@/components/contact/LocationSection";
import { NavigationMenu } from "@/components/navigation/NavigationMenu";
import { UnitPanel } from "@/components/unit/UnitPanel";
import { MultiOfficeSummary } from "@/components/unit/MultiOfficeSummary";
import { initScrollAnimations } from "@/animations/scroll";
import { offices } from "@/data/units";
import { useEnquiry } from "@/providers/EnquiryProvider";
import { useLenis, lenisScrollTo } from "@/hooks/useLenis";
import { ScrollProgress } from "@/components/common/ScrollProgress";
import type { FloorGroupId } from "@/types/floor";
import type { Office } from "@/types/unit";

function scrollToId(id: string) {
  lenisScrollTo(id);
}

export default function PortfolioSite() {
  const root = useRef<HTMLElement>(null);
  const { openEnquiry, isOpen: enquiryOpen } = useEnquiry();
  
  // State for Navigation
  const [menuOpen, setMenuOpen] = useState(false);

  // State for Explorer & Plan
  const [selectedFloor, setSelectedFloor] = useState<FloorGroupId>("offices");
  const [activePlan, setActivePlan] = useState<FloorGroupId>("offices");
  
  // State for Office Selection
  const [selectedOffice, setSelectedOffice] = useState<Office>(() => offices.find((office) => office.id === 1) ?? offices[0]);
  const [officePopupOpen, setOfficePopupOpen] = useState(false);

  // State for Multi-Office Selection Workflow
  const [selectedFloorNumber, setSelectedFloorNumber] = useState<number | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [multiSelectedOffices, setMultiSelectedOffices] = useState<Office[]>([]);
  const [summaryPopupOpen, setSummaryPopupOpen] = useState(false);

  // Disable section-snap whenever any overlay/modal is open
  const isModalOpen = menuOpen || officePopupOpen || summaryPopupOpen || enquiryOpen;
  useLenis({ modalOpen: isModalOpen });

  useEffect(() => {
    const ctx = initScrollAnimations(root);
    return () => ctx.revert();
  }, []);


  const openPlan = () => {
    setActivePlan(selectedFloor);
    window.setTimeout(() => scrollToId("floor-plan"), 40);
  };

  // Handler: "Select more office units" clicked in UnitPanel
  const handleOpenMultiSelect = (floorNumber: number) => {
    // Pre-select the current office
    setMultiSelectedOffices([selectedOffice]);
    setOfficePopupOpen(false);
    setMultiSelectMode(true);
    setActivePlan("offices");
    setSelectedFloorNumber(floorNumber);
    window.setTimeout(() => scrollToId("floor-plan"), 40);
  };

  // Handler: toggle an office in multi-select
  const handleToggleOffice = (office: Office) => {
    setMultiSelectedOffices((prev) => {
      const exists = prev.some((o) => o.id === office.id);
      if (exists) return prev.filter((o) => o.id !== office.id);
      return [...prev, office];
    });
  };

  // Handler: Cancel multi-select → restore single office popup
  const handleCancelMultiSelect = () => {
    setMultiSelectedOffices([]);
    setMultiSelectMode(false);
    setOfficePopupOpen(true);
  };

  // Handler: Done in multi-select toolbar → show summary
  const handleDoneMultiSelect = () => {
    setMultiSelectMode(false);
    setSummaryPopupOpen(true);
  };

  // Handler: "Select more office units" in summary → return to multi-select
  const handleSelectMoreFromSummary = () => {
    setSummaryPopupOpen(false);
    setMultiSelectMode(true);
    window.setTimeout(() => scrollToId("floor-plan"), 40);
  };

  return (
    <main ref={root}>
      <Header onMenu={() => setMenuOpen(true)} scrollToId={scrollToId} />

      <HeroSection scrollToId={scrollToId} />

      <BuildingScene 
        selectedFloor={selectedFloor} 
        setSelectedFloor={setSelectedFloor} 
        openPlan={openPlan} 
      />

      <PlanViewer 
        activePlan={activePlan} 
        setActivePlan={setActivePlan} 
        scrollToId={scrollToId} 
        selectedOffice={selectedOffice} 
        setSelectedOffice={setSelectedOffice} 
        setOfficePopupOpen={setOfficePopupOpen}
        multiSelectMode={multiSelectMode}
        multiSelectedOffices={multiSelectedOffices}
        onToggleOffice={handleToggleOffice}
        onCancelMultiSelect={handleCancelMultiSelect}
        onDoneMultiSelect={handleDoneMultiSelect}
      />

      <InteriorsSection />

      <LocationSection onNotice={() => openEnquiry("location", "general")} />

      {menuOpen && (
        <NavigationMenu onClose={() => setMenuOpen(false)} scrollToId={scrollToId} />
      )}

      {officePopupOpen && (
        <UnitPanel 
          selectedOffice={selectedOffice} 
          onClose={() => setOfficePopupOpen(false)} 
          selectedFloorNumber={selectedFloorNumber}
          onFloorChange={setSelectedFloorNumber}
          onSelectMore={handleOpenMultiSelect}
        />
      )}

      {summaryPopupOpen && (
        <MultiOfficeSummary
          selectedOffices={multiSelectedOffices}
          selectedFloorNumber={selectedFloorNumber}
          onClose={() => setSummaryPopupOpen(false)}
          onSelectMore={handleSelectMoreFromSummary}
        />
      )}

      {multiSelectMode && activePlan === "offices" && (
        <div className={`multi-select-toolbar-relocated ${multiSelectedOffices.length > 0 ? "visible" : ""}`} role="toolbar" aria-label="Multi-office selection controls">
          <div className="multi-select-toolbar-count">
            <Layers size={20} aria-hidden="true" />
            <span>
              <strong>{multiSelectedOffices.length}</strong>{" "}
              {multiSelectedOffices.length === 1 ? "Office" : "Offices"} Selected
            </span>
          </div>
          <div className="multi-select-toolbar-actions">
            <button
              type="button"
              className="multi-select-cancel-btn"
              onClick={handleCancelMultiSelect}
            >
              Cancel
            </button>
            <button
              type="button"
              className="multi-select-done-btn"
              onClick={handleDoneMultiSelect}
              disabled={multiSelectedOffices.length === 0}
            >
              Done – Show selected
            </button>
          </div>
        </div>
      )}

      <ScrollProgress />
    </main>
  );
}
