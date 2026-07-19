import { Maximize2, Check, Route, Building2, Info, ArrowRight, Download, X } from "lucide-react";
import type { Office } from "@/types/unit";

export function UnitPanel({
  selectedOffice,
  onClose,
  onEnquire
}: {
  selectedOffice: Office;
  onClose: () => void;
  onEnquire: () => void;
}) {
  return (
    <div className="office-popup-backdrop" role="presentation" onClick={onClose}>
      <article className="office-popup" role="dialog" aria-modal="true" aria-labelledby="office-popup-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="office-popup-close" onClick={onClose} aria-label="Close office details"><X /></button>
        <header className="office-popup-header">
          <span>Selected Office · Typical Floors 7–22</span>
          <h2 id="office-popup-title">Office {String(selectedOffice.id).padStart(2, "0")}</h2>
          <p>Review the selected office block and essential information.</p>
        </header>

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

        <div className="office-popup-facts">
          <article><Maximize2 /><div><small>Reference Area</small><strong>{selectedOffice.area} sq ft</strong></div></article>
          <article><Check /><div><small>Available</small><strong>Yes</strong></div></article>
          <article><Route /><div><small>Facing</small><strong>{selectedOffice.facing}</strong></div></article>
          <article><Building2 /><div><small>Dimensions</small><strong>{selectedOffice.dimensions}</strong></div></article>
        </div>

        <div className="office-popup-price">
          <Info />
          <div><small>Price</small><strong>Price on Request</strong><p>Final cost sheet will be connected after builder confirmation.</p></div>
        </div>

        <div className="office-popup-actions">
          <button className="accent-button" type="button" onClick={() => { onClose(); onEnquire(); }}>Enquire Now <ArrowRight /></button>
          <a className="outline-button" href="/docs/monopoly-layout-plan.pdf" target="_blank" rel="noreferrer"><Download /> Download Brochure</a>
        </div>
      </article>
    </div>
  );
}
