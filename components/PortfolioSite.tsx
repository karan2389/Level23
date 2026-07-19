"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/common/Header";
import { HeroSection } from "@/components/hero/HeroSection";
import { BuildingScene } from "@/components/building/BuildingScene";
import { PlanViewer } from "@/components/unit/PlanViewer";
import { InteriorsSection } from "@/components/interiors/InteriorsSection";
import { LocationSection } from "@/components/contact/LocationSection";
import { NavigationMenu } from "@/components/navigation/NavigationMenu";
import { UnitPanel } from "@/components/unit/UnitPanel";
import { NoticeModal } from "@/components/common/NoticeModal";
import { initScrollAnimations } from "@/animations/scroll";
import { offices } from "@/data/units";
import type { FloorGroupId } from "@/types/floor";
import type { Office } from "@/types/unit";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function PortfolioSite() {
  const root = useRef<HTMLElement>(null);
  
  // State for Navigation
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);

  // State for Explorer & Plan
  const [selectedFloor, setSelectedFloor] = useState<FloorGroupId>("offices");
  const [activePlan, setActivePlan] = useState<FloorGroupId>("offices");
  
  // State for Office Selection
  const [selectedOffice, setSelectedOffice] = useState<Office>(() => offices.find((office) => office.id === 1) ?? offices[0]);
  const [officePopupOpen, setOfficePopupOpen] = useState(false);

  useEffect(() => {
    const ctx = initScrollAnimations(root);
    return () => ctx.revert();
  }, []);

  const openPlan = () => {
    setActivePlan(selectedFloor);
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
      />

      <InteriorsSection />

      <LocationSection onNotice={() => setNoticeOpen(true)} />

      {menuOpen && (
        <NavigationMenu onClose={() => setMenuOpen(false)} scrollToId={scrollToId} />
      )}

      {officePopupOpen && (
        <UnitPanel 
          selectedOffice={selectedOffice} 
          onClose={() => setOfficePopupOpen(false)} 
          onEnquire={() => setNoticeOpen(true)} 
        />
      )}

      {noticeOpen && (
        <NoticeModal onClose={() => setNoticeOpen(false)} />
      )}
    </main>
  );
}
