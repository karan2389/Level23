"use client";

import { useState } from "react";
import { Maximize2, Route, Building2, Info, ArrowRight, Download, X, Layers, FileText, AlertCircle } from "lucide-react";
import type { Office } from "@/types/unit";

const TYPICAL_FLOORS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export function UnitPanel({
  selectedOffice,
  onClose,
  onEnquire,
  selectedFloorNumber,
  onFloorChange,
  onSelectMore,
}: {
  selectedOffice: Office;
  onClose: () => void;
  onEnquire: () => void;
  selectedFloorNumber: number | null;
  onFloorChange: (floor: number | null) => void;
  onSelectMore: (floor: number) => void;
}) {
  const [floorError, setFloorError] = useState(false);

  const handleSelectMore = () => {
    if (!selectedFloorNumber) {
      setFloorError(true);
      return;
    }
    setFloorError(false);
    onSelectMore(selectedFloorNumber);
  };

  const handleFloorChange = (value: string) => {
    const num = value ? Number(value) : null;
    onFloorChange(num);
    if (num) setFloorError(false);
  };

  return (
    <div className="office-popup-backdrop" role="presentation" onClick={onClose}>
      <article className="office-popup" role="dialog" aria-modal="true" aria-labelledby="office-popup-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="office-popup-close" onClick={onClose} aria-label="Close office details"><X /></button>
        <header className="office-popup-header">
          <span>Selected Office · Typical Floors 7–22</span>
          <h2 id="office-popup-title">Office {String(selectedOffice.id).padStart(2, "0")}</h2>
          <p>Review the selected office block and essential information.</p>
        </header>

        {/* Office preview card */}
        <div
          className="selected-office-crop"
          style={{
            aspectRatio: `${selectedOffice.w * 1600} / ${selectedOffice.h * 742}`,
            backgroundImage: 'url("/images/plans/typical-plan.webp")',
            backgroundSize: `${10000 / selectedOffice.w}% ${10000 / selectedOffice.h}%`,
            backgroundPosition: `${selectedOffice.x / (100 - selectedOffice.w) * 100}% ${selectedOffice.y / (100 - selectedOffice.h) * 100}%`,
          }}
          aria-label={`Cropped floor-plan image for Office ${String(selectedOffice.id).padStart(2, "0")}`}
        >
          <span>Office {String(selectedOffice.id).padStart(2, "0")}</span>
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
                  <AlertCircle size={14} /> Please select a floor first
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
          <article><Route /><div><small>Facing</small><strong>{selectedOffice.facing}</strong></div></article>
          <article><Building2 /><div><small>Dimensions</small><strong>{selectedOffice.dimensions}</strong></div></article>
          <article><Info /><div><small>Compass</small><strong>{selectedOffice.facing === "Window-facing" ? "North wing" : "South wing"}</strong></div></article>
        </div>

        {/* Price + Cost Sheet row */}
        <div className="office-popup-price-row">
          <div className="office-popup-price">
            <Info />
            <div><small>Price</small><strong>Price on Request</strong><p>Final pricing will be added after builder confirmation.</p></div>
          </div>
          <button type="button" className="cost-sheet-btn" onClick={onEnquire} aria-label="Request cost sheet">
            <FileText size={22} />
            <span>Cost Sheet</span>
          </button>
        </div>

        {/* View Cost Sheet */}
        <button type="button" className="view-cost-sheet-btn outline-button" onClick={onEnquire} aria-label="View cost sheet">
          <FileText size={18} /> View Cost Sheet
        </button>

        {/* Actions */}
        <div className="office-popup-actions">
          <button className="accent-button" type="button" onClick={() => { onClose(); onEnquire(); }}>Enquire Now <ArrowRight /></button>
          <a className="outline-button" href="/docs/monopoly-layout-plan.pdf" target="_blank" rel="noreferrer"><Download /> Download Brochure</a>
        </div>
      </article>
    </div>
  );
}
