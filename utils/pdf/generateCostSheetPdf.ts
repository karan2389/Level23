/**
 * generateCostSheetPdf.ts
 *
 * Clean, minimal A4 cost sheet. Invoice/quotation style.
 * Readable, printable, shareable — not a marketing document.
 * No decoration, no gradients, no fancy styling.
 */

import jsPDF from "jspdf";
import { CostSheetSummary } from "@/types/costs";

// ── Utilities ───────────────────────────────────────────────────────────────

function fmt(num: number): string {
  if (isNaN(num) || num == null) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(num));
}

function getOrdinalFloor(n: number): string {
  const j = n % 10, k = n % 100;
  if (j === 1 && k !== 11) return `${n}st Floor`;
  if (j === 2 && k !== 12) return `${n}nd Floor`;
  if (j === 3 && k !== 13) return `${n}rd Floor`;
  return `${n}th Floor`;
}

function getFormattedDate(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

async function fetchBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let b = "";
    for (let i = 0; i < bytes.byteLength; i++) b += String.fromCharCode(bytes[i]);
    const ext = url.split(".").pop()?.toLowerCase();
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${btoa(b)}`;
  } catch {
    return null;
  }
}

// ── Page constants (mm, 8pt grid: 1u = 2mm) ────────────────────────────────

const PW = 210;
const PH = 297;
const ML = 16;           // left margin
const MR = 16;           // right margin
const CW = PW - ML - MR; // 178mm content width

// Colors
type RGB = [number, number, number];
const C_BLACK: RGB = [17, 17, 17];
const C_DARK: RGB = [60, 60, 60];
const C_MID: RGB = [120, 120, 120];
const C_LIGHT: RGB = [195, 195, 195];
const C_RULE: RGB = [220, 220, 220];
const C_BLUE: RGB = [67, 90, 115]; // #435A73
const C_ROWALT: RGB = [249, 250, 252];
const C_THBG: RGB = [242, 244, 247];
const C_WHITE: RGB = [255, 255, 255];

// ── Main export ─────────────────────────────────────────────────────────────

export async function generateCostSheetPdf(
  summary: CostSheetSummary,
  selectedFloorNumber: number | null
): Promise<Blob> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const [level23B64, aksharB64, bhagwatiB64] = await Promise.all([
    fetchBase64("/images/logos/level23.png"),
    fetchBase64("/images/logos/akshar.png"),
    fetchBase64("/images/logos/bhagwati.png"),
  ]);

  let y = 0;

  function checkPage(needed: number) {
    if (y + needed > PH - 18) {
      pdf.addPage();
      y = 16;
    }
  }

  function T(c: RGB) { pdf.setTextColor(c[0], c[1], c[2]); }
  function F(c: RGB) { pdf.setFillColor(c[0], c[1], c[2]); }
  function D(c: RGB) { pdf.setDrawColor(c[0], c[1], c[2]); }

  /** Draw a thin full-width hairline rule */
  function rule(yy: number, c: RGB = C_RULE, lw = 0.2) {
    D(c);
    pdf.setLineWidth(lw);
    pdf.line(ML, yy, ML + CW, yy);
  }

  /** Section heading: bold blue label + hairline below */
  function sectionHead(label: string) {
    checkPage(14);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    T(C_BLUE);
    pdf.text(label, ML, y);
    rule(y + 2, C_LIGHT, 0.25);
    y += 8; // 4 grid units
  }

  // ════════════════════════════════════════════════════════════════════════
  // 1. HEADER
  // ════════════════════════════════════════════════════════════════════════

  y = 16;

  // Left logos (Akshar & Bhagwati)
  if (aksharB64) {
    pdf.addImage(aksharB64, "PNG", ML, y, 25.5, 16, undefined, "FAST");
  }
  if (bhagwatiB64) {
    pdf.addImage(bhagwatiB64, "PNG", ML + 25.5 + 4, y, 24.2, 16, undefined, "FAST");
  }

  // Right logo (Level23)
  if (level23B64) {
    pdf.addImage(level23B64, "PNG", ML + CW - 64.3, y, 64.3, 16, undefined, "FAST");
  }

  y += 20;

  // Full-width rule to separate header from metadata
  rule(y, C_RULE, 0.3);
  y += 6;

  // Meta row: Date | Floor | Units | MahaRERA
  const floorLabel = selectedFloorNumber
    ? getOrdinalFloor(selectedFloorNumber)
    : "Typical Floors 7-22";

  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  T(C_DARK);

  // Two columns: left half and right half
  const leftMeta = `Date: ${getFormattedDate()}     Floor: ${floorLabel}`;
  const rightMeta = `Units: ${summary.items.length}     MahaRERA: P51700053764`;
  pdf.text(leftMeta, ML, y);
  pdf.text(rightMeta, ML + CW, y, { align: "right" });

  y += 6;
  rule(y, C_RULE, 0.3);
  y += 14; // 7 grid units gap

  // ════════════════════════════════════════════════════════════════════════
  // 2. TABLE
  // ════════════════════════════════════════════════════════════════════════

  sectionHead("Cost Sheet");

  // Column widths (must total CW = 178mm)
  // Unit | Carpet Area
  const CW0 = 42, CW1 = CW - CW0;
  const X0 = ML;
  const X1 = ML + CW0;
  const HDRS = ["Unit", "Carpet Area"];
  const TH_H = 9;
  const ROW_H = 9;
  const PAD = 3;

  F(C_THBG);
  pdf.rect(ML, y, CW, TH_H, "F");

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  T(C_DARK);
  pdf.text(HDRS[0], X0 + PAD, y + 6);
  pdf.text(HDRS[1], X1 + CW1 - PAD, y + 6, { align: "right" });

  y += TH_H;

  // Data rows
  summary.items.forEach((item, idx) => {
    checkPage(ROW_H + 2);

    if (idx % 2 !== 0) {
      F(C_ROWALT);
      pdf.rect(ML, y, CW, ROW_H, "F");
    }

    rule(y + ROW_H, C_RULE, 0.15);

    const cy = y + 6.2; // vertical text baseline, centered in row

    // Unit (bold)
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    T(C_BLACK);
    pdf.text(`Unit ${item.officeId}`, X0 + PAD, cy);

    // Other data columns (normal)
    pdf.setFont("helvetica", "normal");
    T(C_DARK);
    pdf.text(`${fmt(item.carpetArea)} sq.ft`, X1 + CW1 - PAD, cy, { align: "right" });

    y += ROW_H;
  });

  // Table closing rule (slightly darker)
  rule(y, [160, 175, 190], 0.35);
  y += 16;

  // ════════════════════════════════════════════════════════════════════════
  // 3. SUMMARY
  const calculatedBasicCost = summary.totalBasicCost + summary.totalFloorRise;
  const elecDeposit = summary.totalDgBackup > 0 ? summary.totalDgBackup : 2500000;
  const calculatedGrandTotal = calculatedBasicCost + summary.totalDevelopment + summary.totalLegal + summary.totalSocietyFormation + elecDeposit + summary.totalRecreational + summary.totalGst + summary.totalStampDuty + summary.totalRegistration;

  const summaryRows: [string, string][] = [
    ["Total Carpet Area", `${fmt(summary.totalCarpetArea)} sq.ft`],
    ["Basic Cost", `Rs. ${fmt(calculatedBasicCost)}`],
    ["Development Charges", `Rs. ${fmt(summary.totalDevelopment)}`],
    ["Legal & Society Formation Charges", `Rs. ${fmt(summary.totalLegal + summary.totalSocietyFormation)}`],
    ["DG Backup", `Rs. ${fmt(elecDeposit)}`],
    ["Recreational Charges", `Rs. ${fmt(summary.totalRecreational)}`],
    ["GST", `Rs. ${fmt(summary.totalGst)}`],
    ["Stamp Duty", `Rs. ${fmt(summary.totalStampDuty)}`],
    ["Registration", `Rs. ${fmt(summary.totalRegistration)}`],
    ["Car Parking", `${summary.items.length * 2} Nos. (Included)`],
  ];

  checkPage(summaryRows.length * 8 + 24);
  sectionHead("Summary");

  const S_ROW_H = 8;

  summaryRows.forEach(([label, value], i) => {
    checkPage(S_ROW_H + 2);

    if (i % 2 !== 0) {
      F(C_ROWALT);
      pdf.rect(ML, y, CW, S_ROW_H, "F");
    }

    const sy = y + 5.5;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    T(C_DARK);
    pdf.text(label, ML + PAD, sy);

    pdf.setFont("helvetica", "bold");
    T(C_BLACK);
    pdf.text(value, ML + CW - PAD, sy, { align: "right" });

    y += S_ROW_H;
  });

  rule(y, C_RULE, 0.2);
  y += 14;

  // ════════════════════════════════════════════════════════════════════════
  // 4. GRAND TOTAL
  // ════════════════════════════════════════════════════════════════════════

  checkPage(28);
  sectionHead("Grand Total");

  // Label and value on one line, left/right aligned
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  T(C_MID);
  pdf.text("GRAND TOTAL", ML + PAD, y + 7);

  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  T(C_BLUE);
  pdf.text(`Rs. ${fmt(calculatedGrandTotal)}`, ML + CW - PAD, y + 7, { align: "right" });

  y += 18;
  rule(y, C_RULE, 0.2);
  y += 14;

  // ════════════════════════════════════════════════════════════════════════
  // 5. NOTES
  // ════════════════════════════════════════════════════════════════════════

  const notes = [
    "Floor Rise Charges: Rs. 50 per sq.ft per floor from the 7th floor onwards.",
    "GST, Stamp Duty, Registration and any other statutory charges are at actuals.",
    "Above quotation is for internal discussion only.",
    "MahaRERA Registration No. P51700053764.",
    "Maintenance charges are applicable at the time of possession.",
  ];

  checkPage(notes.length * 9 + 20);
  sectionHead("Notes");

  notes.forEach((note, i) => {
    checkPage(10);
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    T(C_DARK);
    const noteLines = pdf.splitTextToSize(`${i + 1}.  ${note}`, CW - 6);
    pdf.text(noteLines, ML + PAD, y);
    y += noteLines.length * 5 + 3;
  });

  y += 8;

  // ════════════════════════════════════════════════════════════════════════
  // 6. DISCLAIMER
  // ════════════════════════════════════════════════════════════════════════

  checkPage(16);
  rule(y, C_RULE, 0.2);
  y += 5;

  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  T(C_MID);
  const disc =
    "Disclaimer: This cost sheet is provided solely for preliminary information and discussion purposes. The prices, offers, payment terms, and commercial conditions mentioned herein are indicative and non-binding. Final pricing and commercial negotiations will be conducted exclusively at our site office and shall be confirmed only through the final booking application and agreement.The developer reserves the right to revise prices, offers, inventory availability, specifications, and terms without prior notice.";
  const dLines = pdf.splitTextToSize(disc, CW);
  pdf.text(dLines, ML, y);

  // ════════════════════════════════════════════════════════════════════════
  // 7. PAGE FOOTER (every page)
  // ════════════════════════════════════════════════════════════════════════

  const totalPages = (
    pdf as jsPDF & { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    rule(PH - 10, C_RULE, 0.2);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    T(C_MID);
    pdf.text("Level23 — Premium Office Spaces, Vashi, Navi Mumbai", ML, PH - 6);
    pdf.text(`Page ${p} of ${totalPages}`, ML + CW, PH - 6, { align: "right" });
  }

  return pdf.output("blob");
}
