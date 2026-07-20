"use client";

import { useMemo } from "react";
import { Maximize2, FileText, Download, ArrowRight, X, Layers, Compass } from "lucide-react";
import type { Office } from "@/types/unit";

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
  return facing === "Window-facing" ? "North wing" : "South wing";
}

export function MultiOfficeSummary({
  selectedOffices,
  selectedFloorNumber,
  onClose,
  onEnquire,
  onSelectMore,
}: {
  selectedOffices: Office[];
  selectedFloorNumber: number | null;
  onClose: () => void;
  onEnquire: () => void;
  onSelectMore: () => void;
}) {
  const count = selectedOffices.length;

  const totals = useMemo(() => {
    const totalRefArea = selectedOffices.reduce((sum, o) => sum + o.area, 0);
    const totalCarpetArea = selectedOffices.reduce((sum, o) => sum + o.carpetArea, 0);
    const combinedDimensions = buildCombinedDimensions(selectedOffices);
    const uniqueFacings = [...new Set(selectedOffices.map((o) => o.facing))];
    const uniqueWings = [...new Set(uniqueFacings.map(wingFromFacing))];
    const compass = uniqueWings.length === 1 ? uniqueWings[0] : uniqueWings.join(" & ");
    return { totalRefArea, totalCarpetArea, combinedDimensions, compass };
  }, [selectedOffices]);

  return (
    <div className="office-popup-backdrop" role="presentation" onClick={onClose}>
      <article
        className="office-popup summary-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-popup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="office-popup-close" onClick={onClose} aria-label="Close summary">
          <X />
        </button>

        {/* Header */}
        <header className="office-popup-header">
          <span>Selected Office Collection · Typical Floors 7–22{selectedFloorNumber ? ` · Floor ${selectedFloorNumber}` : ""}</span>
          <h2 id="summary-popup-title">{count} Selected {count === 1 ? "Office" : "Offices"}</h2>
          <p>Review every selected unit and the combined reference information.</p>
        </header>

        {/* Office cards */}
        {count === 0 ? (
          <p className="summary-empty">No offices selected. Go back and select some units.</p>
        ) : (
          <div className={`summary-office-cards ${count === 1 ? "summary-cards-one" : count === 2 ? "summary-cards-two" : ""}`}>
            {selectedOffices.map((office) => (
              <div key={office.id} className="summary-office-card">
                <div
                  className="summary-office-crop"
                  style={{
                    backgroundImage: 'url("/images/plans/typical-plan.webp")',
                    backgroundSize: `${10000 / office.w}% ${10000 / office.h}%`,
                    backgroundPosition: `${office.x / (100 - office.w) * 100}% ${office.y / (100 - office.h) * 100}%`,
                  }}
                  aria-label={`Office ${String(office.id).padStart(2, "0")} thumbnail`}
                >
                  <span className="summary-office-badge">Office {String(office.id).padStart(2, "0")}</span>
                </div>
                <div className="summary-office-info">
                  <strong>Office {String(office.id).padStart(2, "0")}</strong>
                  <span>{office.area} sq ft · {wingFromFacing(office.facing)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Select More CTA */}
        <button type="button" className="office-select-more-btn summary-select-more" onClick={onSelectMore}>
          <span className="office-select-more-icon"><Layers size={20} /></span>
          <span className="office-select-more-text">
            <strong>Select more office units</strong>
            <small>Return to the plan and update this selection</small>
          </span>
          <ArrowRight size={18} className="office-select-more-arrow" />
        </button>

        {/* Combined stats */}
        <div className="office-popup-facts summary-stats-grid">
          <article>
            <Maximize2 />
            <div>
              <small>Total Reference Area</small>
              <strong>{totals.totalRefArea.toLocaleString()} sq ft</strong>
            </div>
          </article>
          <article>
            <FileText />
            <div>
              <small>Total Carpet Area</small>
              <strong>{totals.totalCarpetArea.toFixed(2)} sq ft</strong>
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
              <small>Compass</small>
              <strong>{totals.compass}</strong>
            </div>
          </article>
        </div>

        {/* Price + Cost Sheet row */}
        <div className="office-popup-price-row">
          <div className="office-popup-price">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <small>Combined Price</small>
              <strong>Price on Request</strong>
              <p>A combined cost sheet will be connected after builder confirmation.</p>
            </div>
          </div>
          <button type="button" className="cost-sheet-btn" onClick={onEnquire} aria-label="Request combined cost sheet">
            <FileText size={22} />
            <span>Cost Sheet</span>
          </button>
        </div>

        {/* Actions */}
        <div className="office-popup-actions">
          <button className="accent-button" type="button" onClick={() => { onClose(); onEnquire(); }}>
            Enquire for Selected Units <ArrowRight />
          </button>
          <a className="outline-button" href="/docs/monopoly-layout-plan.pdf" target="_blank" rel="noreferrer">
            <Download /> Download Brochure
          </a>
        </div>
      </article>
    </div>
  );
}
