"use client";

import React from "react";
import { X, Download, Building2, ArrowRight, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Office } from "@/types/unit";
import { OfficeCostData } from "@/types/costs";
import { calculateCostSheet, formatCurrency } from "@/utils/costCalculator";

import { fetchLiveCostMap } from "@/utils/fetchCosts";

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
  const [isDownloading, setIsDownloading] = React.useState(false);

  React.useEffect(() => {
    fetchLiveCostMap().then((data) => setCostMap(data));
  }, []);

  const summary = calculateCostSheet(selectedOffices, selectedFloorNumber, costMap);
  const floorText = selectedFloorNumber ? `Floor ${selectedFloorNumber}` : "Typical Floors 7–22";

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById("printable-cost-sheet");
      if (!element) return;

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#faf7f2" });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const officeNumbers = summary.items.map((item) => item.unitNo).join("_");
      const filename = `Level23_Cost_Sheet_${officeNumbers || "Units"}.pdf`;
      const blob = pdf.output("blob");

      // Robust fallback function with delayed revocation
      const fallbackDownload = () => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Delay cleanup so browser download manager has time to read the filename
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 1000);
      };

      // Use modern File System Access API if available (Chrome/Edge)
      if ('showSaveFilePicker' in window) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'PDF Document',
              accept: { 'application/pdf': ['.pdf'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err: unknown) {
          // If user cancels, AbortError is thrown. Only fallback on other errors.
          if (err instanceof Error && err.name !== 'AbortError') {
            console.error("FilePicker error:", err);
            fallbackDownload();
          } else if (!(err instanceof Error)) {
            fallbackDownload();
          }
        }
      } else {
        fallbackDownload();
      }
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
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

        {/* Printable Area - Light Theme with Dark Numbers */}
        <div id="printable-cost-sheet" className="cost-sheet-content" style={{ backgroundColor: "#faf7f2", color: "#111111", padding: "1.25rem", borderRadius: "12px" }}>
          {/* Office Units Table */}
          <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem", color: "#000000" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(0,0,0,0.15)", color: "#333333" }}>
                  <th style={{ padding: "0.75rem" }}>Unit No</th>
                  <th style={{ padding: "0.75rem" }}>Area</th>
                  <th style={{ padding: "0.75rem" }}>Rate</th>
                  <th style={{ padding: "0.75rem" }}>Floor Rise</th>
                  <th style={{ padding: "0.75rem", textAlign: "right" }}>Agreement Value</th>
                </tr>
              </thead>
              <tbody>
                {summary.items.map((item) => (
                  <tr key={item.officeId} style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", color: "#000000" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 700, color: "#000000" }}>{item.unitNo}</td>
                    <td style={{ padding: "0.75rem", color: "#222222" }}>{item.area} sq.ft</td>
                    <td style={{ padding: "0.75rem", color: "#000000", fontWeight: 600 }}>{formatCurrency(item.rate)}</td>
                    <td style={{ padding: "0.75rem", color: "#000000" }}>{formatCurrency(item.floorRise)}</td>
                    <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 700, color: "#000000" }}>
                      {formatCurrency(item.totalSubtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Calculations Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", backgroundColor: "#f2ece4", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#555555", display: "block", fontWeight: 500 }}>Combined Carpet Area</span>
              <strong style={{ fontSize: "1.1rem", color: "#000000", fontWeight: 700 }}>{summary.totalArea.toFixed(2)} sq.ft</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#555555", display: "block", fontWeight: 500 }}>Basic Cost</span>
              <strong style={{ fontSize: "1.1rem", color: "#000000", fontWeight: 700 }}>{formatCurrency(summary.totalBasicCost)}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#555555", display: "block", fontWeight: 500 }}>Total Floor Rise</span>
              <strong style={{ fontSize: "1.1rem", color: "#000000", fontWeight: 700 }}>{formatCurrency(summary.totalFloorRise)}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#555555", display: "block", fontWeight: 500 }}>Dev & Amenities</span>
              <strong style={{ fontSize: "1.1rem", color: "#000000", fontWeight: 700 }}>
                {formatCurrency(summary.totalDevelopment + summary.totalDgBackup + summary.totalRecreational)}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#555555", display: "block", fontWeight: 500 }}>Legal & Society Form.</span>
              <strong style={{ fontSize: "1.1rem", color: "#000000", fontWeight: 700 }}>
                {formatCurrency(summary.totalLegal + summary.totalSocietyFormation)}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: "0.8rem", color: "#555555", display: "block", fontWeight: 500 }}>Other Charges</span>
              <strong style={{ fontSize: "1.1rem", color: "#000000", fontWeight: 700 }}>{formatCurrency(summary.totalOtherCharges)}</strong>
            </div>
          </div>

          {/* Grand Totals Summary Card */}
          <div style={{ padding: "1.25rem", borderRadius: "12px", background: "linear-gradient(135deg, rgba(201,160,99,0.25), rgba(201,160,99,0.1))", border: "1px solid rgba(201,160,99,0.4)", marginBottom: "1.5rem", color: "#000000" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#333333", fontWeight: 500 }}>Total Agreement Value</span>
              <strong style={{ color: "#000000" }}>{formatCurrency(summary.totalSubtotal)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#333333", fontWeight: 500 }}>GST (12%)</span>
              <strong style={{ color: "#000000" }}>{formatCurrency(summary.totalGst)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#333333", fontWeight: 500 }}>Stamp Duty (6%)</span>
              <strong style={{ color: "#000000" }}>{formatCurrency(summary.totalStampDuty)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px dashed rgba(0,0,0,0.2)" }}>
              <span style={{ color: "#333333", fontWeight: 500 }}>Registration</span>
              <strong style={{ color: "#000000" }}>{formatCurrency(summary.totalRegistration)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#8a662e", textTransform: "uppercase", letterSpacing: "0.05em" }}>FINAL GRAND TOTAL</span>
              <strong style={{ fontSize: "1.6rem", color: "#000000", fontWeight: 800 }}>{formatCurrency(summary.grandTotal)}</strong>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="office-popup-actions" style={{ marginTop: "1rem" }}>
          <button className="accent-button" type="button" onClick={() => { onClose(); onEnquire(); }}>
            Book / Enquire Now <ArrowRight size={18} />
          </button>
          <button className="outline-button" type="button" onClick={handleDownloadPDF} disabled={isDownloading} style={{ opacity: isDownloading ? 0.7 : 1, cursor: isDownloading ? "wait" : "pointer" }}>
            {isDownloading ? <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} /> : <Download size={18} />} 
            {isDownloading ? "Generating PDF..." : "Download Cost Sheet"}
          </button>
        </div>
      </article>
    </div>
  );
}
