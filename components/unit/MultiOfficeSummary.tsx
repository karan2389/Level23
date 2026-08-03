"use client";

import { useMemo, useState } from "react";
import { FileText, Download, ArrowRight, Layers, Compass } from "lucide-react";
import type { Office } from "@/types/unit";
import { CostSheetModal } from "./CostSheetModal";
import { useEnquiry } from "@/providers/EnquiryProvider";
import { OverlayLayout } from "../common/OverlayLayout";
import { OverlayHeader } from "../common/OverlayHeader";
import { StickyActionBar } from "../common/StickyActionBar";
import { getOfficeFacing } from "@/utils/officeUtils";

// Parse the frontage value (feet part) from a dimensions string like "15'5\" × 47'9\""
function parseFrontageFeet(dimensions: string): number {
  const match = dimensions.match(/^(\d+)'/);
  return match ? parseInt(match[1], 10) : 0;
}
function parseFrontageInches(dimensions: string): number {
  const match = dimensions.match(/^(\d+)'(\d+)/);
  return match ? parseInt(match[2], 10) : 0;
}

// Build "combined frontage × depth" string from multiple offices
function buildCombinedDimensions(offices: Office[]): string {
  if (offices.length === 0) return "—";
  if (offices.length === 1) return offices[0].dimensions;

  let totalInches = 0;
  for (const office of offices) {
    const feet = parseFrontageFeet(office.dimensions);
    const inches = parseFrontageInches(office.dimensions);
    totalInches += feet * 12 + inches;
  }
  const totalFeet = Math.floor(totalInches / 12);
  const remainingInches = totalInches % 12;

  // Depth is the same for all typical offices (47'9")
  const depthMatch = offices[0].dimensions.match(/×\s*([\d'"\s]+)$/);
  const depth = depthMatch ? depthMatch[1].trim() : `47'9"`;

  return `${totalFeet}'${remainingInches}" combined frontage × ${depth}`;
}

// Derive wing from facing
function wingFromFacing(facing: string): string {
  return facing === "Sea-facing" ? "North wing" : "South wing";
}

export function MultiOfficeSummary({
  selectedOffices,
  selectedFloorNumber,
  onClose,
  onSelectMore,
}: {
  selectedOffices: Office[];
  selectedFloorNumber: number | null;
  onClose: () => void;
  onSelectMore: () => void;
}) {
  const count = selectedOffices.length;
  const [showCostSheet, setShowCostSheet] = useState(false);
  const { openEnquiry } = useEnquiry();

  const totals = useMemo(() => {
    const totalCarpetArea = selectedOffices.reduce((sum, o) => sum + o.carpetArea, 0);
    const combinedDimensions = buildCombinedDimensions(selectedOffices);
    const uniqueFacings = [...new Set(selectedOffices.map((o) => getOfficeFacing(o.id)))];
    const combinedFacing = uniqueFacings.length === 1 ? uniqueFacings[0] : uniqueFacings.join(" & ");
    return { totalCarpetArea, combinedDimensions, combinedFacing };
  }, [selectedOffices]);

  return (
    <OverlayLayout onClose={onClose}>
      <OverlayHeader 
        title={`${count} Selected ${count === 1 ? "Office" : "Offices"}`}
        subtitle={`Typical Floors 7–22${selectedFloorNumber ? ` · Floor ${selectedFloorNumber}` : ""}`}
        onBack={onClose}
        onClose={onClose}
      />

      <div className="premium-overlay-content">
        {/* Office cards (concise text-only layout) */}
        {count === 0 ? (
          <p className="summary-empty">No offices selected. Go back and select some units.</p>
        ) : (
          <div className="premium-dashboard-grid">
            {selectedOffices.map((office) => (
              <div key={office.id} className="summary-office-card text-only" style={{ background: "rgba(255,255,255,0.6)", borderRadius: "16px", padding: "16px", border: "1px solid var(--line)" }}>
                <div className="summary-card-title" style={{ fontSize: "1.1rem", fontWeight: "500", marginBottom: "8px" }}>Office {String(office.id).padStart(2, "0")}</div>
                <div className="summary-card-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span className="summary-card-label" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Carpet Area</span>
                  <span className="summary-card-value" style={{ fontWeight: "500" }}>{office.carpetArea}</span>
                </div>
                <div className="summary-card-row" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="summary-card-label" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Facing</span>
                  <span className="summary-card-value" style={{ fontWeight: "500" }}>{getOfficeFacing(office.id)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Combined stats */}
        <div className="office-popup-facts summary-stats-grid" style={{ marginTop: "24px" }}>
          <article>
            <FileText />
            <div>
              <small>Total Carpet Area</small>
              <strong>{totals.totalCarpetArea.toFixed(2)}</strong>
            </div>
          </article>
          <article>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /><line x1="8" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="16" y2="21" /></svg>
            <div>
              <small>Combined Dimensions</small>
              <strong>{totals.combinedDimensions}</strong>
            </div>
          </article>
          <article>
            <Compass />
            <div>
              <small>Facing</small>
              <strong>{totals.combinedFacing}</strong>
            </div>
          </article>
        </div>

        {/* Select More CTA */}
        <div style={{ marginTop: "24px" }}>
          <button type="button" className="office-select-more-btn summary-select-more" onClick={onSelectMore}>
            <span className="office-select-more-icon"><Layers size={20} /></span>
            <span className="office-select-more-text">
              <strong>Select more office units</strong>
              <small>Return to the plan and update this selection</small>
            </span>
            <ArrowRight size={18} className="office-select-more-arrow" />
          </button>
        </div>

        {/* Price + Cost Sheet row */}
        <div className="office-popup-price-row" style={{ marginTop: "24px" }}>
          <div className="office-popup-price">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <div>
              <small>Combined Price</small>
              <strong>Price on Request</strong>
            </div>
          </div>
          <button type="button" className="cost-sheet-btn" onClick={() => setShowCostSheet(true)} aria-label="Request combined cost sheet">
            <FileText size={22} />
            <span>Cost Sheet</span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <StickyActionBar>
        <button className="accent-button" type="button" onClick={() => { openEnquiry("floor-plan", "floor-plan", { floor: selectedFloorNumber, offices: selectedOffices }); }}>
          Enquire for Selected Units <ArrowRight />
        </button>
        <a className="outline-button" href="/docs/monopoly-layout-plan.pdf" target="_blank" rel="noreferrer">
          <Download /> Download Brochure
        </a>
      </StickyActionBar>

      {showCostSheet && (
        <CostSheetModal
          selectedOffices={selectedOffices}
          selectedFloorNumber={selectedFloorNumber}
          onClose={() => setShowCostSheet(false)}
        />
      )}
    </OverlayLayout>
  );
}
