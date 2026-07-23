"use client";

import React from "react";
import { X, FileText, Printer, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { Office } from "@/types/unit";
import { OfficeCostData } from "@/types/costs";
import { calculateCostSheet, formatCurrency } from "@/utils/costCalculator";

interface CostSheetModalProps {
  selectedOffices: Office[];
  selectedFloorNumber: number | null;
  costMap?: Record<string, OfficeCostData>;
  onClose: () => void;
  onEnquire: () => void;
}

export function CostSheetModal({
  selectedOffices,
  selectedFloorNumber,
  costMap: initialCostMap,
  onClose,
  onEnquire,
}: CostSheetModalProps) {
  const [costMap, setCostMap] = React.useState<Record<string, OfficeCostData>>(initialCostMap || {});

  React.useEffect(() => {
    fetch("/api/costs")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setCostMap(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching live costs:", err));
  }, []);

  const summary = calculateCostSheet(selectedOffices, selectedFloorNumber, costMap);
  const floorText = selectedFloorNumber ? `Floor ${selectedFloorNumber}` : "Typical Floors 7–22";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="office-popup-backdrop" role="presentation" onClick={onClose} style={{ zIndex: 1100 }}>
      <article
        className="office-popup summary-popup cost-sheet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cost-sheet-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px", width: "95%" }}
      >
        <button type="button" className="office-popup-close" onClick={onClose} aria-label="Close cost sheet">
          <X />
        </button>

        {/* Header */}
        <header className="office-popup-header" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-color, #c9a063)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <Building2 size={16} /> Commercial Investment Breakdown
          </div>
          <h2 id="cost-sheet-title" style={{ fontSize: "1.75rem", margin: "0.25rem 0" }}>
            Official Estimate Cost Sheet
          </h2>
          <p style={{ opacity: 0.8 }}>{selectedOffices.length} Selected Units · {floorText}</p>
        </header>

        {/* Printable Area */}
        <div id="printable-cost-sheet" className="cost-sheet-content">
          {/* Office Units Table */}
          <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  <th style={{ padding: "0.75rem" }}>Unit No</th>
                  <th style={{ padding: "0.75rem" }}>Area</th>
                  <th style={{ padding: "0.75rem" }}>Rate</th>
                  <th style={{ padding: "0.75rem" }}>Floor Rise</th>
                  <th style={{ padding: "0.75rem", textAlign: "right" }}>Agreement Value</th>
                </tr>
              </thead>
              <tbody>
                {summary.items.map((item) => (
                  <tr key={item.officeId} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 600 }}>{item.unitNo}</td>
                    <td style={{ padding: "0.75rem" }}>{item.area} sq.ft</td>
                    <td style={{ padding: "0.75rem" }}>{formatCurrency(item.rate)}</td>
                    <td style={{ padding: "0.75rem" }}>{formatCurrency(item.floorRise)}</td>
                    <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 600 }}>
                      {formatCurrency(item.totalSubtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Calculations Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", backgroundColor: "rgba(255,255,255,0.03)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", display: "block" }}>Combined Carpet Area</span>
              <strong style={{ fontSize: "1.1rem" }}>{summary.totalArea.toFixed(2)} sq.ft</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", display: "block" }}>Basic Cost</span>
              <strong style={{ fontSize: "1.1rem" }}>{formatCurrency(summary.totalBasicCost)}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", display: "block" }}>Total Floor Rise</span>
              <strong style={{ fontSize: "1.1rem" }}>{formatCurrency(summary.totalFloorRise)}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", display: "block" }}>Dev & Amenities</span>
              <strong style={{ fontSize: "1.1rem" }}>
                {formatCurrency(summary.totalDevelopment + summary.totalDgBackup + summary.totalRecreational)}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", display: "block" }}>Legal & Society Form.</span>
              <strong style={{ fontSize: "1.1rem" }}>
                {formatCurrency(summary.totalLegal + summary.totalSocietyFormation)}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", display: "block" }}>Other Charges</span>
              <strong style={{ fontSize: "1.1rem" }}>{formatCurrency(summary.totalOtherCharges)}</strong>
            </div>
          </div>

          {/* Grand Totals Summary Card */}
          <div style={{ padding: "1.25rem", borderRadius: "12px", background: "linear-gradient(135deg, rgba(201,160,99,0.15), rgba(201,160,99,0.05))", border: "1px solid rgba(201,160,99,0.3)", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ opacity: 0.8 }}>Total Agreement Value</span>
              <strong>{formatCurrency(summary.totalSubtotal)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ opacity: 0.8 }}>GST (12%)</span>
              <strong>{formatCurrency(summary.totalGst)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ opacity: 0.8 }}>Stamp Duty (6%)</span>
              <strong>{formatCurrency(summary.totalStampDuty)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px dashed rgba(255,255,255,0.2)" }}>
              <span style={{ opacity: 0.8 }}>Registration</span>
              <span>{formatCurrency(summary.totalRegistration)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-color, #c9a063)", fontWeight: 700 }}>Final Grand Total</span>
                <p style={{ fontSize: "0.75rem", opacity: 0.6, margin: 0 }}>*Exact to client's sheet</p>
              </div>
              <strong style={{ fontSize: "1.5rem", color: "#ffffff" }}>{formatCurrency(summary.grandTotal)}</strong>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="office-popup-actions" style={{ marginTop: "1rem" }}>
          <button className="accent-button" type="button" onClick={() => { onClose(); onEnquire(); }}>
            Book / Enquire Now <ArrowRight size={18} />
          </button>
          <button className="outline-button" type="button" onClick={handlePrint}>
            <Printer size={18} /> Print Cost Sheet
          </button>
        </div>
      </article>
    </div>
  );
}
