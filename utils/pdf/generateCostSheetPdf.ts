/**
 * generateCostSheetPdf.ts - Premium Edition
 *
 * Professional A4 commercial quotation document for Level23.
 * Visual redesign only - all business logic and data mapping unchanged.
 * Uses jsPDF native text/drawing API. No DOM screenshots.
 *
 * Design: Premium commercial real-estate aesthetic.
 * 8pt grid system (1 grid unit = 2mm).
 * Color palette: Navy #435A73, White backgrounds, no orange/beige.
 */

import jsPDF from "jspdf";
import { CostSheetSummary } from "@/types/costs";

// ── Formatting helpers ──────────────────────────────────────────────────────

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

// ── Design tokens (mm, 8pt grid: 1 unit = 2mm) ─────────────────────────────

const PW = 210;           // A4 width
const PH = 297;           // A4 height
const ML = 14;            // margin left
const MR = 14;            // margin right
const CW = PW - ML - MR; // content width = 182mm

type RGB = [number, number, number];

// Color palette — premium slate-blue, no orange/beige
const C_NAVY:     RGB = [22,  44,  63];   // deep dark navy  #162C3F
const C_SLATE:    RGB = [67,  90,  115];  // primary accent  #435A73
const C_SLATE_L:  RGB = [75,  97,  120];  // lighter slate   #4B6178
const C_SLATE_D:  RGB = [64,  88,  112];  // darker slate    #405870
const C_WHITE:    RGB = [255, 255, 255];
const C_INK:      RGB = [18,  32,  46];   // very dark text
const C_BODY:     RGB = [55,  70,  85];   // body text
const C_MUTED:    RGB = [100, 118, 132];  // grey labels
const C_CAPTION:  RGB = [148, 162, 174];  // light grey captions
const C_BG:       RGB = [247, 250, 253];  // very light page bg
const C_BORDER:   RGB = [213, 226, 236];  // subtle border
const C_ROW_ALT:  RGB = [244, 248, 252];  // alternating table row
const C_TH_BG:    RGB = [226, 237, 246];  // table header
const C_ACCENT_L: RGB = [233, 242, 250];  // light accent bg

// ── Main export ─────────────────────────────────────────────────────────────

export async function generateCostSheetPdf(
  summary: CostSheetSummary,
  selectedFloorNumber: number | null
): Promise<Blob> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const [aksharB64, bhagwatiB64, level23B64] = await Promise.all([
    fetchBase64("/images/logos/akshar.png"),
    fetchBase64("/images/logos/bhagwati.png"),
    fetchBase64("/images/logos/level23.png"),
  ]);

  let y = 0;

  function checkPage(needed: number) {
    if (y + needed > PH - 16) {
      pdf.addPage();
      y = 16;
    }
  }

  function T(c: RGB)  { pdf.setTextColor(c[0], c[1], c[2]); }
  function F(c: RGB)  { pdf.setFillColor(c[0], c[1], c[2]); }
  function D(c: RGB)  { pdf.setDrawColor(c[0], c[1], c[2]); }

  function hline(yy: number, c: RGB = C_BORDER, lw = 0.2) {
    D(c);
    pdf.setLineWidth(lw);
    pdf.line(ML, yy, ML + CW, yy);
  }

  function sectionHeading(text: string) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    T(C_SLATE);
    pdf.setCharSpace(1.5);
    pdf.text(text, ML, y);
    pdf.setCharSpace(0);
    // Accent underline bar (8mm wide, 1.5mm tall)
    F(C_SLATE);
    pdf.rect(ML, y + 2, 24, 1, "F");
    y += 8; // 4mm heading + 4mm gap below
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. HEADER BAND
  // ══════════════════════════════════════════════════════════════════════════

  // Top navy accent bar (4mm)
  F(C_SLATE);
  pdf.rect(0, 0, PW, 4, "F");

  // White header background
  F(C_WHITE);
  pdf.rect(0, 4, PW, 44, "F");

  // --- Logo Row (y: 4 to 30mm) ---
  // Divide into 3 equal zones of ~60.7mm each
  const zW = CW / 3;

  // Akshar (left zone): width = zW - 20mm padding, height = auto
  if (aksharB64) {
    const lw = Math.min(zW - 16, 50);
    pdf.addImage(aksharB64, "PNG", ML + 8, 9, lw, 0, undefined, "FAST");
  }

  // Level23 (center zone): slightly larger to be dominant
  if (level23B64) {
    const lw = Math.min(zW - 6, 58);
    pdf.addImage(level23B64, "PNG", ML + zW + 3, 7, lw, 0, undefined, "FAST");
  }

  // Bhagwati (right zone)
  if (bhagwatiB64) {
    const lw = Math.min(zW - 16, 50);
    pdf.addImage(bhagwatiB64, "PNG", ML + 2 * zW + 8, 9, lw, 0, undefined, "FAST");
  }

  // "PREMIUM OFFICE SPACES" tagline centered
  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "bold");
  T(C_MUTED);
  pdf.setCharSpace(2);
  pdf.text("PREMIUM OFFICE SPACES", PW / 2, 34, { align: "center" });
  pdf.setCharSpace(0);

  // Thin separator
  D(C_BORDER);
  pdf.setLineWidth(0.25);
  pdf.line(0, 38, PW, 38);

  // Title row (y: 40–60mm) - dark band
  F([236, 243, 249]);
  pdf.rect(0, 38, PW, 22, "F");

  // "Official Estimate Cost Sheet"
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  T(C_NAVY);
  pdf.text("Official Estimate Cost Sheet", ML, 52);

  // MahaRERA badge on the right of the title row
  const reraX = PW - MR - 56;
  const reraY = 41;
  F(C_WHITE);
  D(C_BORDER);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(reraX, reraY, 56, 16, 1.5, 1.5, "FD");
  // Left accent strip on badge
  F(C_SLATE);
  pdf.rect(reraX, reraY, 2.5, 16, "F");
  pdf.setFontSize(6);
  pdf.setFont("helvetica", "bold");
  T(C_INK);
  pdf.text("MAHARERA REGISTERED", reraX + 5.5, reraY + 6);
  pdf.setFont("helvetica", "normal");
  T(C_MUTED);
  pdf.text("No. P51700053764", reraX + 5.5, reraY + 10.5);
  pdf.setFontSize(5.5);
  pdf.text("maharera.mahaonline.gov.in", reraX + 5.5, reraY + 14);

  // Header bottom separator (2mm navy bar)
  F(C_SLATE);
  pdf.rect(0, 60, PW, 1.5, "F");

  y = 64;

  // ══════════════════════════════════════════════════════════════════════════
  // 2. INFORMATION BAR  (Date | Floor | Units)
  // ══════════════════════════════════════════════════════════════════════════

  const floorLabel = selectedFloorNumber
    ? getOrdinalFloor(selectedFloorNumber)
    : "Typical Floors 7-22";

  const infoItems: [string, string][] = [
    ["GENERATED", getFormattedDate()],
    ["FLOOR", floorLabel],
    ["UNITS SELECTED", `${summary.items.length} Office${summary.items.length !== 1 ? "s" : ""}`],
  ];

  const INFO_H = 16;
  const infoW = CW / infoItems.length;

  F(C_ACCENT_L);
  D(C_BORDER);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(ML, y, CW, INFO_H, 2, 2, "FD");

  infoItems.forEach(([label, value], i) => {
    const cx = ML + i * infoW + infoW / 2;

    if (i > 0) {
      D(C_BORDER);
      pdf.setLineWidth(0.2);
      pdf.line(ML + i * infoW, y + 3, ML + i * infoW, y + INFO_H - 3);
    }

    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    T(C_MUTED);
    pdf.setCharSpace(1);
    pdf.text(label, cx, y + 5.5, { align: "center" });
    pdf.setCharSpace(0);

    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "bold");
    T(C_INK);
    pdf.text(value, cx, y + 12.5, { align: "center" });
  });

  y += INFO_H + 14; // 14mm gap = 7 grid units

  // ══════════════════════════════════════════════════════════════════════════
  // 3. UNITS TABLE
  // ══════════════════════════════════════════════════════════════════════════

  checkPage(20 + summary.items.length * 10 + 6);

  sectionHeading("COMMERCIAL INVESTMENT BREAKDOWN");

  // Column widths (must sum to CW = 182mm)
  // Unit | Carpet Area | Rate (psf) | Floor Rise | Agreement Value
  const COL: [number, number, number, number, number] = [20, 40, 34, 36, CW - 20 - 40 - 34 - 36];
  const CX: [number, number, number, number, number] = [
    ML,
    ML + COL[0],
    ML + COL[0] + COL[1],
    ML + COL[0] + COL[1] + COL[2],
    ML + COL[0] + COL[1] + COL[2] + COL[3],
  ];
  const HDRS = ["UNIT", "CARPET AREA", "RATE (PSF)", "FLOOR RISE", "AGREEMENT VALUE"];

  // Table header row
  const TH_H = 10;
  F(C_TH_BG);
  pdf.rect(ML, y, CW, TH_H, "F");
  D(C_SLATE);
  pdf.setLineWidth(0.3);
  pdf.line(ML, y, ML + CW, y);
  pdf.line(ML, y + TH_H, ML + CW, y + TH_H);

  HDRS.forEach((h, i) => {
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    T(C_NAVY);
    pdf.setCharSpace(0.5);
    if (i === 4) {
      pdf.text(h, CX[i] + COL[i] - 3, y + 6.5, { align: "right" });
    } else {
      pdf.text(h, CX[i] + 3, y + 6.5);
    }
    pdf.setCharSpace(0);
  });
  y += TH_H;

  // Data rows
  const ROW_H = 10;
  summary.items.forEach((item, idx) => {
    checkPage(ROW_H + 2);
    const bg: RGB = idx % 2 === 0 ? C_WHITE : C_ROW_ALT;
    F(bg);
    pdf.rect(ML, y, CW, ROW_H, "F");
    D(C_BORDER);
    pdf.setLineWidth(0.15);
    pdf.line(ML, y + ROW_H, ML + CW, y + ROW_H);

    // Unit number (bold, dark)
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "bold");
    T(C_INK);
    pdf.text(`Unit ${item.officeId}`, CX[0] + 3, y + 6.5);

    // Other columns (normal weight)
    pdf.setFont("helvetica", "normal");
    T(C_BODY);
    pdf.text(`${fmt(item.carpetArea)} sq.ft`, CX[1] + 3, y + 6.5);
    pdf.text(`Rs. ${fmt(item.rate)}`, CX[2] + 3, y + 6.5);
    pdf.text(idx === 0 ? `Rs. ${fmt(summary.totalFloorRise)}` : "—", CX[3] + 3, y + 6.5);

    // Agreement value (right-aligned, bold)
    pdf.setFont("helvetica", "bold");
    T(C_INK);
    pdf.text(`Rs. ${fmt(item.basicCost)}`, CX[4] + COL[4] - 3, y + 6.5, { align: "right" });

    y += ROW_H;
  });

  // Table footer bar
  D(C_SLATE_D);
  pdf.setLineWidth(0.4);
  pdf.line(ML, y, ML + CW, y);

  y += 16; // 8 grid units gap

  // ══════════════════════════════════════════════════════════════════════════
  // 4. COST SUMMARY — KPI CARDS  (4 per row, 2 rows)
  // ══════════════════════════════════════════════════════════════════════════

  const kpiData: [string, string][] = [
    ["Combined Carpet Area",   `${fmt(summary.totalCarpetArea)} sq.ft`],
    ["Basic Agreement Value",  `Rs. ${fmt(summary.totalBasicCost)}`],
    ["Total Floor Rise",       `Rs. ${fmt(summary.totalFloorRise)}`],
    ["Development Charges",    `Rs. ${fmt(summary.totalDevelopment)}`],
    ["Legal & Society",        `Rs. ${fmt(summary.totalLegal + summary.totalSocietyFormation + summary.totalRecreational)}`],
    ["Other Charges",          `Rs. ${fmt(summary.totalOtherCharges)}`],
    ["Electricity & Water",    `Rs. ${fmt(summary.totalDgBackup > 0 ? summary.totalDgBackup : 2500000)}`],
    ["Car Parking",            `${summary.items.length * 2} Nos. (Incl.)`],
  ];

  const CARD_COLS = 4;
  const CARD_GAP  = 4;  // 2 grid units
  const CARD_W    = (CW - (CARD_COLS - 1) * CARD_GAP) / CARD_COLS; // ~41.5mm each
  const CARD_H    = 20; // 10 grid units
  const CARD_ROWS = Math.ceil(kpiData.length / CARD_COLS);

  checkPage((CARD_H + CARD_GAP) * CARD_ROWS + 16);

  sectionHeading("COST SUMMARY");

  for (let row = 0; row < CARD_ROWS; row++) {
    checkPage(CARD_H + CARD_GAP);
    for (let col = 0; col < CARD_COLS; col++) {
      const idx = row * CARD_COLS + col;
      if (idx >= kpiData.length) break;
      const [label, value] = kpiData[idx];
      const cx = ML + col * (CARD_W + CARD_GAP);

      // Card shell: white bg + subtle border
      F(C_WHITE);
      D(C_BORDER);
      pdf.setLineWidth(0.2);
      pdf.roundedRect(cx, y, CARD_W, CARD_H, 1.5, 1.5, "FD");

      // Top accent strip (navy, 2px)
      F(C_SLATE);
      pdf.rect(cx, y, CARD_W, 1.5, "F");

      // Label (small, muted)
      pdf.setFontSize(6.5);
      pdf.setFont("helvetica", "normal");
      T(C_MUTED);
      pdf.text(label, cx + 4, y + 8);

      // Value (larger, dark bold)
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      T(C_INK);
      const valLines = pdf.splitTextToSize(value, CARD_W - 8);
      pdf.text(valLines, cx + 4, y + 15.5);
    }
    y += CARD_H + CARD_GAP;
  }

  y += 12; // 6 grid units gap

  // ══════════════════════════════════════════════════════════════════════════
  // 5. GRAND TOTAL PANEL
  // ══════════════════════════════════════════════════════════════════════════

  const otherFees = summary.totalOtherCharges + summary.totalDevelopment +
    summary.totalLegal + summary.totalSocietyFormation + summary.totalRecreational;
  const elecDeposit = summary.totalDgBackup > 0 ? summary.totalDgBackup : 2500000;
  const maintenance = summary.totalCarpetArea * 100;

  const grandRows: [string, string][] = [
    ["Total Agreement Value",             `Rs. ${fmt(summary.totalBasicCost)}`],
    ["GST",                               `Rs. ${fmt(summary.totalGst)}`],
    ["Maintenance",                       `Rs. ${fmt(maintenance)}`],
    ["Other Charges / FSI / IFMS / Legal",`Rs. ${fmt(otherFees)}`],
    ["Electricity & Water Deposit",       `Rs. ${fmt(elecDeposit)}`],
    ["Car Parking",                       `${summary.items.length * 2} Nos. (Included)`],
  ];

  // Panel height: top padding (8) + rows (9 each) + separator (6) + grand total (18) + bottom (8)
  const PANEL_H = 8 + grandRows.length * 9 + 6 + 20 + 8;
  checkPage(PANEL_H + 16);

  sectionHeading("GRAND TOTAL");

  // Panel card
  F(C_WHITE);
  D(C_BORDER);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(ML, y, CW, PANEL_H, 2, 2, "FD");

  // Left navy accent strip (3mm wide, full height)
  F(C_SLATE);
  pdf.rect(ML, y, 3, PANEL_H, "F");

  // Two-column line items
  let ry = y + 10;
  grandRows.forEach(([label, value]) => {
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "normal");
    T(C_BODY);
    pdf.text(label, ML + 8, ry);

    pdf.setFont("helvetica", "bold");
    T(C_INK);
    pdf.text(value, ML + CW - 6, ry, { align: "right" });
    ry += 9;
  });

  // Dashed separator
  pdf.setLineDashPattern([2, 1.5], 0);
  D([185, 205, 220]);
  pdf.setLineWidth(0.3);
  pdf.line(ML + 8, ry, ML + CW - 8, ry);
  pdf.setLineDashPattern([], 0);
  ry += 4;

  // Grand total highlight band
  F(C_ACCENT_L);
  pdf.rect(ML + 3, ry, CW - 3, 18, "F");

  // "FINAL GRAND TOTAL" label
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  T(C_SLATE);
  pdf.setCharSpace(1);
  pdf.text("FINAL GRAND TOTAL", ML + 9, ry + 7);
  pdf.setCharSpace(0);

  // Grand total value (large, prominent)
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  T(C_NAVY);
  pdf.text(`Rs. ${fmt(summary.grandTotal)}`, ML + CW - 6, ry + 12, { align: "right" });

  y += PANEL_H + 14; // 7 grid units gap

  // ══════════════════════════════════════════════════════════════════════════
  // 6. NOTES
  // ══════════════════════════════════════════════════════════════════════════

  const notes = [
    "Floor Rise Charges: Rs. 50 per sq.ft per floor from the 7th floor onwards.",
    "GST, Stamp Duty, Registration and any other statutory charges are at actuals.",
    "The above quotation is for internal discussion only.",
    "MahaRERA Registration No. P51700053764.",
    "Maintenance charges are applicable at the time of possession.",
  ];

  const NOTE_H = 10;
  const NOTES_PANEL_H = 10 + notes.length * NOTE_H + 4;
  checkPage(NOTES_PANEL_H + 16);

  sectionHeading("NOTES & TERMS");

  // Notes panel: light bg, no heavy border
  F(C_BG);
  D(C_BORDER);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(ML, y, CW, NOTES_PANEL_H, 2, 2, "FD");

  let noteY = y + 10;
  notes.forEach((note, i) => {
    // Circle badge with number
    F(C_SLATE);
    pdf.circle(ML + 9, noteY - 1.5, 2.8, "F");

    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    T(C_WHITE);
    pdf.text(String(i + 1), ML + 9, noteY - 0.3, { align: "center" });

    // Note text
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    T(C_BODY);
    const noteLines = pdf.splitTextToSize(note, CW - 20);
    pdf.text(noteLines, ML + 15, noteY);

    // Subtle divider (except last)
    if (i < notes.length - 1) {
      D(C_BORDER);
      pdf.setLineWidth(0.15);
      pdf.line(ML + 6, noteY + 4, ML + CW - 6, noteY + 4);
    }
    noteY += NOTE_H;
  });

  y += NOTES_PANEL_H + 8;

  // ══════════════════════════════════════════════════════════════════════════
  // 7. DISCLAIMER FOOTER
  // ══════════════════════════════════════════════════════════════════════════

  checkPage(18);
  D(C_BORDER);
  pdf.setLineWidth(0.2);
  pdf.line(ML, y, ML + CW, y);
  y += 5;

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  T(C_CAPTION);
  const disclaimer =
    "Disclaimer: All specifications, drawings, amenities, facilities, parameters, floor plans, etc., shown in " +
    "this document are subject to change as per approvals from the respective authorities. The final discretion " +
    "remains with the developers. This document is for internal discussion and reference purposes only and does " +
    "not constitute a legal agreement.";
  const dLines = pdf.splitTextToSize(disclaimer, CW);
  pdf.text(dLines, ML, y);

  // ══════════════════════════════════════════════════════════════════════════
  // 8. PAGE FOOTER (every page)
  // ══════════════════════════════════════════════════════════════════════════

  const totalPages = (
    pdf as jsPDF & { internal: { getNumberOfPages: () => number } }
  ).internal.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);

    // Navy footer bar (8mm from bottom)
    F(C_SLATE_D);
    pdf.rect(0, PH - 8, PW, 8, "F");

    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    T(C_WHITE);
    pdf.text(
      "Level23 - Premium Office Spaces, Vashi, Navi Mumbai",
      ML,
      PH - 3.5
    );
    pdf.text(
      `www.level23.co.in   |   Page ${p} of ${totalPages}`,
      PW - MR,
      PH - 3.5,
      { align: "right" }
    );
  }

  return pdf.output("blob");
}
