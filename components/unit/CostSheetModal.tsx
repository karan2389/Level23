"use client";

import React from "react";
import { Download, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Office } from "@/types/unit";
import { OfficeCostData } from "@/types/costs";
import { calculateCostSheet } from "@/utils/costCalculator";
import { fetchLiveCostMap } from "@/utils/fetchCosts";
import { useEnquiry } from "@/providers/EnquiryProvider";
import { OverlayLayout } from "../common/OverlayLayout";
import { OverlayHeader } from "../common/OverlayHeader";
import { StickyActionBar } from "../common/StickyActionBar";
import { generateCostSheetPdf } from "@/utils/pdf/generateCostSheetPdf";
import { formatUnitNumber } from "@/utils/officeUtils";

interface CostSheetModalProps {
  selectedOffices: Office[];
  selectedFloorNumber: number | null;
  costMap?: Record<string, OfficeCostData>;
  onClose: () => void;
}

function formatNumberIN(num: number): string {
  if (isNaN(num) || num === undefined || num === null) return "0";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(num));
}

function getOrdinalFloor(floorNum: number | null): string {
  if (!floorNum) return "1st Floor";
  const j = floorNum % 10;
  const k = floorNum % 100;
  if (j === 1 && k !== 11) return `${floorNum}st Floor`;
  if (j === 2 && k !== 12) return `${floorNum}nd Floor`;
  if (j === 3 && k !== 13) return `${floorNum}rd Floor`;
  return `${floorNum}th Floor`;
}

function getFormattedDate(): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function CostSheetModal({
  selectedOffices,
  selectedFloorNumber,
  costMap: initialCostMap,
  onClose,
}: CostSheetModalProps) {
  const { openEnquiry } = useEnquiry();
  const [costMap, setCostMap] = React.useState<Record<string, OfficeCostData>>(initialCostMap || {});
  const [isDownloading, setIsDownloading] = React.useState(false);

  React.useEffect(() => {
    fetchLiveCostMap().then((data) => setCostMap(data));
  }, []);

  const summary = calculateCostSheet(selectedOffices, selectedFloorNumber, costMap);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Generate structured PDF from calculated summary data (no DOM screenshots)
      const blob = await generateCostSheetPdf(summary, selectedFloorNumber);

      const officeNumbers = summary.items.map((item) => item.unitNo).join("_");
      const filename = `Level23_Cost_Sheet_${officeNumbers || "Units"}.pdf`;

      const fallbackDownload = () => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 1000);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ("showSaveFilePicker" in window) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [
              {
                description: "PDF Document",
                accept: { "application/pdf": [".pdf"] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err: unknown) {
          if (err instanceof Error && err.name !== "AbortError") {
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
    <OverlayLayout onClose={onClose} zIndex={130}>
      <OverlayHeader title="Cost Sheet" onBack={onClose} onClose={onClose} />

      <div className="premium-overlay-content cost-sheet-page-content" style={{ padding: 0, backgroundColor: "#faf7f2" }}>
        {/* Printable & Visible Cost Sheet Area */}
        <div
          id="printable-cost-sheet"
          style={{
            backgroundColor: "#faf7f2",
            color: "#111111",
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
            fontFamily: "var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
          }}
        >
          {/* Logo Branding Header Strip */}
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
              backgroundColor: "#faf7f2",
            }}
          >
            <style>{`
              .cost-sheet-branding-desktop {
                display: none;
                align-items: center;
                justify-content: space-between;
                column-gap: 0.5rem;
                width: 100%;
              }
              .cost-sheet-desktop-partner-logos,
              .cost-sheet-desktop-rera,
              .cost-sheet-mobile-top-row,
              .cost-sheet-mobile-partner-logos,
              .cost-sheet-mobile-rera {
                display: flex;
                align-items: center;
              }
              .cost-sheet-desktop-partner-logos {
                gap: 0.75rem;
              }
              .cost-sheet-desktop-level,
              .cost-sheet-mobile-level {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
              }
              .cost-sheet-desktop-rera {
                gap: 0.5rem;
                padding: 0.5rem 0.75rem;
                border: 1px solid #e0b4b4;
                border-radius: 0.5rem;
                background-color: rgba(255, 255, 255, 0.8);
              }
              .cost-sheet-rera-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                border-radius: 0.25rem;
                background-color: #fff1f1;
                color: #c53030;
              }
              .cost-sheet-branding-mobile {
                display: flex;
                flex-direction: column;
                width: 100%;
                row-gap: 0.85rem;
                overflow: hidden;
              }
              .cost-sheet-mobile-top-row {
                justify-content: space-between;
                width: 100%;
                gap: 0.75rem;
                min-width: 0;
              }
              .cost-sheet-mobile-partner-logos {
                gap: 0.5rem;
                min-width: 0;
                flex: 1 1 auto;
                overflow: hidden;
              }
              .cost-sheet-mobile-rera {
                gap: 0.4rem;
                flex: 0 0 auto;
                width: clamp(126px, 38vw, 176px);
                max-width: 46%;
                padding: 0.45rem 0.55rem;
                border: 1px solid #e0b4b4;
                border-radius: 0.5rem;
                background-color: rgba(255, 255, 255, 0.8);
                overflow: hidden;
              }
              .cost-sheet-mobile-rera-copy {
                min-width: 0;
                text-align: left;
                line-height: 1.2;
              }
              .cost-sheet-mobile-rera-title,
              .cost-sheet-mobile-rera-url {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .cost-sheet-mobile-rera-title {
                font-size: 0.58rem;
                font-weight: 800;
                color: #111827;
              }
              .cost-sheet-mobile-rera-url {
                margin-top: 0.15rem;
                font-size: 0.47rem;
                color: #4b5563;
              }
              @media (min-width: 768px) {
                .cost-sheet-branding-desktop {
                  display: flex;
                }
                .cost-sheet-branding-mobile {
                  display: none;
                }
              }
              @media (max-width: 767px) {
                .cost-sheet-page-content {
                  width: 100vw;
                  max-width: none;
                  min-height: 100dvh;
                  margin: 0;
                  border-radius: 0;
                }
                #printable-cost-sheet {
                  min-height: 100dvh;
                  padding-bottom: 11rem;
                }
                .cost-sheet-branding-desktop {
                  display: none;
                }
                .cost-sheet-branding-mobile {
                  display: flex;
                }
              }
              @media (max-width: 360px) {
                .cost-sheet-mobile-top-row {
                  gap: 0.5rem;
                }
                .cost-sheet-mobile-partner-logos {
                  gap: 0.35rem;
                }
                .cost-sheet-mobile-rera {
                  width: 118px;
                  max-width: 43%;
                  padding: 0.4rem 0.45rem;
                }
                .cost-sheet-mobile-rera-title {
                  font-size: 0.52rem;
                }
                .cost-sheet-mobile-rera-url {
                  font-size: 0.42rem;
                }
              }
            `}</style>

            {/* Desktop Layout */}
            <div className="cost-sheet-branding-desktop hidden md:flex items-center justify-between gap-x-2 w-full">
              {/* 1. Left Logos (Akshar & Bhagwati) */}
              <div className="cost-sheet-desktop-partner-logos flex items-center gap-3">
                <img
                  src="/images/logos/akshar.png"
                  alt="Akshar"
                  className="object-contain"
                  style={{ height: "48px", width: "auto" }}
                  crossOrigin="anonymous"
                />
                <div className="bg-black/15" style={{ height: "32px", width: "1px" }} />
                <img
                  src="/images/logos/bhagwati.png"
                  alt="Bhagwati"
                  className="object-contain"
                  style={{ height: "48px", width: "auto" }}
                  crossOrigin="anonymous"
                />
              </div>

              {/* 2. LEVEL23 Logo (Center) */}
              <div className="cost-sheet-desktop-level flex flex-col items-center justify-center text-center">
                <img
                  src="/images/logos/level23.png"
                  alt="Level 23"
                  className="object-contain"
                  style={{ height: "40px", width: "auto" }}
                  crossOrigin="anonymous"
                />
                <span className="font-bold tracking-[0.2em] text-gray-600 uppercase mt-0.5" style={{ fontSize: "10px" }}>
                  PREMIUM OFFICE SPACES
                </span>
              </div>

              {/* 3. MahaRERA Box (Right) */}
              <div className="cost-sheet-desktop-rera flex items-center gap-2 px-3 py-2 border border-[#e0b4b4] rounded-lg bg-white/80">
                <div className="cost-sheet-rera-icon flex items-center justify-center rounded bg-red-50 text-[#c53030] shrink-0" style={{ width: "28px", height: "28px" }}>
                  <Building2 size={16} />
                </div>
                <div className="text-left leading-tight">
                  <div className="font-bold text-gray-900 tracking-tight" style={{ fontSize: "12px" }}>
                    MAHARERA # P52100079469
                  </div>
                  <div className="text-gray-500 mt-0.5" style={{ fontSize: "9px" }}>
                    Available at website: maharera.mahaonline.gov.in
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="cost-sheet-branding-mobile flex md:hidden flex-col w-full gap-y-3 overflow-hidden">
              {/* Row 1: Partner Logos + MahaRERA */}
              <div className="cost-sheet-mobile-top-row flex items-center justify-between w-full gap-2 min-w-0">
                <div className="cost-sheet-mobile-partner-logos flex items-center gap-1.5 min-w-0 flex-shrink">
                  <img
                    src="/images/logos/akshar.png"
                    alt="Akshar"
                    className="object-contain"
                    style={{ height: "30px", width: "auto", maxWidth: "90px", flexShrink: 1 }}
                    crossOrigin="anonymous"
                  />
                  <div className="bg-black/15 shrink-0" style={{ height: "24px", width: "1px" }} />
                  <img
                    src="/images/logos/bhagwati.png"
                    alt="Bhagwati"
                    className="object-contain"
                    style={{ height: "30px", width: "auto", maxWidth: "96px", flexShrink: 1 }}
                    crossOrigin="anonymous"
                  />
                </div>

                <div className="cost-sheet-mobile-rera flex items-center gap-1.5 px-2 py-1 border border-[#e0b4b4] rounded-lg bg-white/80 shrink-0 overflow-hidden">
                  <div className="cost-sheet-rera-icon flex items-center justify-center rounded bg-red-50 text-[#c53030] shrink-0" style={{ width: "20px", height: "20px" }}>
                    <Building2 size={11} />
                  </div>
                  <div className="cost-sheet-mobile-rera-copy text-left leading-tight min-w-0">
                    <div className="cost-sheet-mobile-rera-title font-bold text-gray-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                      MAHARERA # P52100079469
                    </div>
                    <div className="cost-sheet-mobile-rera-url">
                      Available at website: maharera.mahaonline.gov.in
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: LEVEL23 Logo */}
              <div className="cost-sheet-mobile-level flex flex-col items-center justify-center text-center w-full">
                <img
                  src="/images/logos/level23.png"
                  alt="Level 23"
                  className="object-contain"
                  style={{ width: "clamp(150px, 48vw, 210px)", height: "auto", maxHeight: "52px" }}
                  crossOrigin="anonymous"
                />
                <span className="font-bold tracking-[0.2em] text-gray-600 uppercase mt-0.5" style={{ fontSize: "9px" }}>
                  PREMIUM OFFICE SPACES
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Body */}
          <div
            style={{
              padding: "2rem 1.35rem 12rem",
              width: "100%",
              boxSizing: "border-box",
              maxWidth: "1180px",
              margin: "0 auto",
            }}
          >
            {/* Title Block */}
            <div style={{ marginBottom: "1.35rem" }}>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#050505", margin: 0, letterSpacing: "-0.01em" }}>
                Cost Sheet
              </h1>
              <p style={{ fontSize: "0.78rem", color: "#333333", margin: "0.85rem 0 0", fontWeight: 500 }}>
                {summary.items.length} Selected Units · {selectedFloorNumber ? getOrdinalFloor(selectedFloorNumber) : "Typical Floors 7–22"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem", color: "#c57f3c", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <Building2 size={14} />
              <span>Commercial Investment Breakdown</span>
            </div>

            {/* Units Table */}
            <div style={{ overflowX: "auto", marginBottom: "1.35rem" }}>
              <table style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.18)", color: "#111111", fontWeight: 800 }}>
                    <th style={{ padding: "0.85rem 0.65rem" }}>Unit No</th>
                    <th style={{ padding: "0.85rem 0.65rem", textAlign: "right" }}>Carpet Area</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.items.map((item, idx) => (
                    <tr key={item.officeId} style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", color: "#050505" }}>
                      <td style={{ padding: "0.95rem 0.65rem", fontWeight: 800 }}>{formatUnitNumber(item.floor || selectedFloorNumber, item.officeId)}</td>
                      <td style={{ padding: "0.95rem 0.65rem", textAlign: "right", fontWeight: 600 }}>{formatNumberIN(item.carpetArea)} sq.ft</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Slab */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1.1rem 2rem",
                padding: "1.2rem 1.35rem",
                borderRadius: "8px",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                backgroundColor: "#eee8df",
                marginBottom: "1.35rem",
              }}
            >
              <div>
                <span style={{ display: "block", fontSize: "0.68rem", color: "#1f2933", fontWeight: 500 }}>Combined Carpet Area</span>
                <strong style={{ display: "block", marginTop: "0.18rem", fontSize: "0.95rem", color: "#000000", fontWeight: 900 }}>{formatNumberIN(summary.totalCarpetArea)} sq.ft</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.68rem", color: "#1f2933", fontWeight: 500 }}>Car Park</span>
                <strong style={{ display: "block", marginTop: "0.18rem", fontSize: "0.95rem", color: "#000000", fontWeight: 900 }}>{summary.items.length} Nos. (Included)</strong>
              </div>
            </div>

            {/* Final Total Panel */}
            <div
              style={{
                borderRadius: "8px",
                border: "1px solid #e0b46e",
                background: "linear-gradient(135deg, #f2eadc 0%, #fbf6ed 100%)",
                padding: "1.2rem 1.35rem",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.6rem 1rem", alignItems: "center", fontSize: "0.82rem", color: "#111111" }}>
                <span style={{ fontWeight: 700 }}>Basic Cost</span>
                <strong style={{ fontWeight: 900 }}>₹{formatNumberIN(summary.totalBasicCost + summary.totalFloorRise)}</strong>

                <span style={{ fontWeight: 700 }}>Development Charges</span>
                <strong style={{ fontWeight: 900 }}>₹{formatNumberIN(summary.totalDevelopment)}</strong>

                <span style={{ fontWeight: 700 }}>Legal & Society Formation Charges</span>
                <strong style={{ fontWeight: 900 }}>₹{formatNumberIN(summary.totalLegal + summary.totalSocietyFormation)}</strong>

                <span style={{ fontWeight: 700 }}>DG Backup </span>
                <strong style={{ fontWeight: 900 }}>₹{formatNumberIN(summary.totalDgBackup > 0 ? summary.totalDgBackup : 2500000)}</strong>

                <span style={{ fontWeight: 700 }}>Recreational Charges</span>
                <strong style={{ fontWeight: 900 }}>₹{formatNumberIN(summary.totalRecreational)}</strong>

                <span style={{ fontWeight: 700 }}>GST (12%)</span>
                <strong style={{ fontWeight: 900 }}>₹{formatNumberIN(summary.totalGst)}</strong>

                <span style={{ fontWeight: 700 }}>Stamp Duty (6%)</span>
                <strong style={{ fontWeight: 900 }}>₹{formatNumberIN(summary.totalStampDuty)}</strong>

                <span style={{ fontWeight: 700 }}>Registration</span>
                <strong style={{ fontWeight: 900 }}>₹{formatNumberIN(summary.totalRegistration)}</strong>
              </div>

              <div style={{ borderTop: "1px dashed rgba(0,0,0,0.22)", marginTop: "0.85rem", paddingTop: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem" }}>
                <span style={{ color: "#8a551c", fontSize: "0.86rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Grand Total</span>
                <strong style={{ color: "#000000", fontSize: "1.45rem", lineHeight: 1, fontWeight: 950, textAlign: "right" }}>₹{formatNumberIN((summary.totalBasicCost + summary.totalFloorRise) + summary.totalDevelopment + summary.totalLegal + summary.totalSocietyFormation + (summary.totalDgBackup > 0 ? summary.totalDgBackup : 2500000) + summary.totalRecreational + summary.totalGst + summary.totalStampDuty + summary.totalRegistration)}</strong>
              </div>
            </div>

            {/* Notes & Disclaimer */}
            <h5 style={{ textAlign: "center", fontWeight: 900, letterSpacing: "0.04em" }}>(ONLY FOR VIEWING PURPOSE)</h5>
            <div style={{ marginTop: "1.25rem", border: "1px solid rgba(0,0,0,0.42)", backgroundColor: "#faf7f2", color: "#111111" }}>
              <div style={{ padding: "0.45rem 0.75rem", textAlign: "center", borderBottom: "1px solid rgba(0,0,0,0.42)", fontFamily: "serif", fontSize: "1.35rem", fontWeight: 900, letterSpacing: "0.04em" }}>
                NOTES:
              </div>
              {[
                "Floor Rise Charges:- Rs 50 Psf Per Floor From 7th Floor Onwards.",
                "GST, Stamp Duty, Registration And Any Other Statutory Charges At Actuals.",
                "Above Quotation Is For Internal Discussion Only.",
                "MahaRERA no - P51700053764.",
                "Maintenance Charges at the time of possession.",
              ].map((note, index) => (
                <div key={note} style={{ display: "flex", gap: "0.45rem", padding: "0.42rem 0.75rem", borderBottom: index < 4 ? "1px solid rgba(0,0,0,0.42)" : "none", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.04em" }}>
                  <span style={{ flex: "0 0 auto" }}>{index + 1})</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>

            <p style={{ margin: "0.8rem 0 0", fontSize: "0.72rem", lineHeight: 1.55, color: "#333333", fontWeight: 600 }}>
              Disclaimer: This cost sheet is provided solely for preliminary information and discussion purposes. The prices, offers, payment terms, and commercial conditions mentioned herein are indicative and non-binding. Final pricing and commercial negotiations will be conducted exclusively at our site office and shall be confirmed only through the final booking application and agreement.

              The developer reserves the right to revise prices, offers, inventory availability, specifications, and terms without prior notice.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Action Buttons */}
      <StickyActionBar>
        <button
          className="accent-button"
          type="button"
          onClick={() => {
            onClose();
            openEnquiry("cost-sheet", "floor-plan", { floor: selectedFloorNumber, offices: selectedOffices });
          }}
        >
          Book / Enquire Now <ArrowRight size={18} />
        </button>
        <button
          className="outline-button"
          type="button"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          style={{ opacity: isDownloading ? 0.7 : 1, cursor: isDownloading ? "wait" : "pointer" }}
        >
          {isDownloading ? (
            <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Download size={18} />
          )}
          {isDownloading ? "Generating PDF..." : "Download Cost Sheet"}
        </button>
      </StickyActionBar>
    </OverlayLayout>
  );
}
