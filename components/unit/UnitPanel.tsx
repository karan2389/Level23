"use client";

import { useState } from "react";
import { Building2, Route, Maximize2, Download, ArrowRight, Info, Layers, AlertCircle } from "lucide-react";
import type { Office } from "@/types/unit";
import { PLAN_HEIGHT, PLAN_WIDTH } from "@/constants/plan";
import { useEnquiry } from "@/providers/EnquiryProvider";
import { OverlayLayout } from "../common/OverlayLayout";
import { OverlayHeader } from "../common/OverlayHeader";
import { StickyActionBar } from "../common/StickyActionBar";
import { getOfficeFacing } from "@/utils/officeUtils";
import { CostSheetModal } from "./CostSheetModal";
import { FileText } from "lucide-react";

const TYPICAL_FLOORS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export function UnitPanel({
  selectedOffice,
  onClose,
  selectedFloorNumber,
  onFloorChange,
  onSelectMore,
}: {
  selectedOffice: Office;
  onClose: () => void;
  selectedFloorNumber: number | null;
  onFloorChange: (floor: number | null) => void;
  onSelectMore: (floor: number) => void;
}) {
  const [floorError, setFloorError] = useState(false);
  const [showCostSheet, setShowCostSheet] = useState(false);
  const { openEnquiry } = useEnquiry();

  const handleSelectMore = () => {
    const floorToUse = selectedFloorNumber || TYPICAL_FLOORS[0];
    setFloorError(false);
    onSelectMore(floorToUse);
  };

  const handleFloorChange = (value: string) => {
    const num = value ? Number(value) : null;
    onFloorChange(num);
    if (num) setFloorError(false);
  };

  const validateFloorSelection = () => {
    if (!selectedFloorNumber) {
      setFloorError(true);
      return false;
    }
    return true;
  };

  return (
    <OverlayLayout onClose={onClose}>
      <OverlayHeader 
        title={`Office ${String(selectedOffice.id).padStart(2, "0")}`}
        subtitle="Typical Floors 7–22"
        onBack={onClose}
        onClose={onClose}
      />
      
      <div className="premium-overlay-content">
        {/* Office summary card */}
        <div className="summary-office-card text-only" style={{ background: "rgba(255,255,255,0.6)", borderRadius: "16px", padding: "16px", border: "1px solid var(--line)", marginBottom: "20px" }}>
          <div className="summary-card-title" style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "12px", borderBottom: "1px solid var(--line)", paddingBottom: "12px" }}>
            Office {String(selectedOffice.id).padStart(2, "0")}
          </div>
          <div className="summary-card-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span className="summary-card-label" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Carpet Area</span>
            <span className="summary-card-value" style={{ fontWeight: "500" }}>{selectedOffice.carpetArea}</span>
          </div>
          <div className="summary-card-row" style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="summary-card-label" style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Wing</span>
            <span className="summary-card-value" style={{ fontWeight: "500" }}>{selectedOffice.facing === "Sea-facing" ? "North wing" : "South wing"}</span>
          </div>
        </div>

        {/* Select Floor + Select More CTA */}
        <div className="office-select-more-section">
          <div className="office-floor-select-row">
            <div className="office-floor-select-wrap">
              <label htmlFor="select-floor-dropdown" className="sr-only">Select Floor</label>
              <select
                id="select-floor-dropdown"
                className={`office-floor-select${floorError ? " error" : ""}`}
                value={selectedFloorNumber ?? ""}
                onChange={(e) => handleFloorChange(e.target.value)}
                aria-required="true"
                aria-invalid={floorError}
              >
                <option value="" disabled>Select Floor</option>
                {TYPICAL_FLOORS.map((floor) => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
              </select>
              {floorError && (
                <span className="office-floor-error" role="alert">
                  <AlertCircle size={14} /> Please select a floor to proceed.
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="office-select-more-btn"
            onClick={handleSelectMore}
            aria-label="Select multiple office units"
          >
            <span className="office-select-more-icon"><Layers size={20} /></span>
            <span className="office-select-more-text">
              <strong>Select more office units</strong>
              <small>Compare or combine multiple adjoining units</small>
            </span>
            <ArrowRight size={18} className="office-select-more-arrow" />
          </button>
        </div>

        {/* Facts grid */}
        <div className="office-popup-facts">
          <article><Maximize2 /><div><small>Carpet Area</small><strong>{selectedOffice.carpetArea}</strong></div></article>
          <article><Route /><div><small>Facing</small><strong>{getOfficeFacing(selectedOffice.id)}</strong></div></article>
          <article><Building2 /><div><small>Dimensions</small><strong>{selectedOffice.dimensions}</strong></div></article>
          <article><Info /><div><small>Compass</small><strong>{selectedOffice.facing === "Sea-facing" ? "North wing" : "South wing"}</strong></div></article>
        </div>
      </div>

      {/* Actions */}
      <StickyActionBar>
        <button className="accent-button" type="button" onClick={() => { if (validateFloorSelection()) openEnquiry("floor-plan", "floor-plan", { floor: selectedFloorNumber, offices: [selectedOffice] }); }}>
          Enquire Now <ArrowRight />
        </button>
        <button className="outline-button" type="button" onClick={() => { if (validateFloorSelection()) setShowCostSheet(true); }} style={{ background: "white" }}>
          <FileText /> Cost Sheet
        </button>
        <a className="outline-button" href="/docs/monopoly-layout-plan.pdf" target="_blank" rel="noreferrer">
          <Download /> Download Brochure
        </a>
      </StickyActionBar>

      {showCostSheet && (
        <CostSheetModal
          selectedOffices={[selectedOffice]}
          selectedFloorNumber={selectedFloorNumber}
          onClose={() => setShowCostSheet(false)}
        />
      )}
    </OverlayLayout>
  );
}

