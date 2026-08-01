/**
 * generateCostSheetPdf.ts
 *
 * Generates a professional A4 PDF Cost Sheet using jsPDF's native text/drawing API.
 * Input: CostSheetSummary (already-calculated values from calculateCostSheet)
 * Output: Blob (ready for download)
 *
 * NO html2canvas. NO DOM screenshots. Pure structured-data -> PDF.
 */

import jsPDF from "jspdf";
import { CostSheetSummary } from "@/types/costs";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(num: number): string {
  if (isNaN(num) || num == null) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(num)
  );
}

function getOrdinalFloor(n: number): string {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return `${n}st Floor`;
  if (j === 2 && k !== 12) return `${n}nd Floor`;
  if (j === 3 && k !== 13) return `${n}rd Floor`;
  return `${n}th Floor`;
}

function getFormattedDate(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Fetch a public asset and return a base64 data-URL string */
async function fetchBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const ext = url.split(".").pop()?.toLowerCase();
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

// ─── page constants (mm) ────────────────────────────────────────────────────

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_L = 14;
const MARGIN_R = 14;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

// Brand colours [R, G, B]
const NAVY: [number, number, number] = [23, 54, 77];
const WARM: [number, number, number] = [197, 127, 60];
const BLACK: [number, number, number] = [5, 5, 5];
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_BG: [number, number, number] = [250, 247, 242];
const SLAB_BG: [number, number, number] = [238, 232, 223];
const TOTAL_BG: [number, number, number] = [242, 234, 220];

// ─── main export ────────────────────────────────────────────────────────────

export async function generateCostSheetPdf(
  summary: CostSheetSummary,
  selectedFloorNumber: number | null
): Promise<Blob> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Pre-fetch logos in parallel
  const [aksharB64, bhagwatiB64, level23B64] = await Promise.all([
    fetchBase64("/images/logos/akshar.png"),
    fetchBase64("/images/logos/bhagwati.png"),
    fetchBase64("/images/logos/level23.png"),
  ]);

  let y = MARGIN_L;

  function needPage(height: number) {
    if (y + height > PAGE_H - 14) {
      pdf.addPage();
      y = MARGIN_L;
    }
  }

  function setColor(rgb: [number, number, number]) {
    pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
  }

  function setFill(rgb: [number, number, number]) {
    pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  }

  function setDraw(rgb: [number, number, number]) {
    pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
  }

  // ── HEADER ──────────────────────────────────────────────────────────────
  setFill([248, 243, 237]);
  pdf.rect(0, 0, PAGE_W, 28, "F");

  if (aksharB64) {
    pdf.addImage(aksharB64, "PNG", MARGIN_L, 5, 0, 16, undefined, "FAST");
  }

  if (level23B64) {
    const logoW = 32;
    pdf.addImage(level23B64, "PNG", PAGE_W / 2 - logoW / 2, 3, logoW, 0, undefined, "FAST");
  }
  pdf.setFontSize(5);
  pdf.setFont("helvetica", "bold");
  setColor([85, 105, 120]);
  pdf.text("PREMIUM OFFICE SPACES", PAGE_W / 2, 24, { align: "center", charSpace: 1 });

  if (bhagwatiB64) {
    pdf.addImage(bhagwatiB64, "PNG", PAGE_W / 2 + 20, 5, 0, 16, undefined, "FAST");
  }

  // MahaRERA box
  const reraX = PAGE_W - MARGIN_R - 48;
  const reraY = 5;
  const reraW = 48;
  const reraH = 16;
  setFill(WHITE);
  setDraw([224, 180, 180]);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(reraX, reraY, reraW, reraH, 1.5, 1.5, "FD");
  setFill([255, 241, 241]);
  pdf.rect(reraX + 2, reraY + 2, 6, 6, "F");
  pdf.setFontSize(6);
  pdf.setFont("helvetica", "bold");
  setColor([17, 24, 39]);
  pdf.text("MAHARERA # P52100079469", reraX + 10, reraY + 7);
  pdf.setFontSize(5);
  pdf.setFont("helvetica", "normal");
  setColor([75, 85, 99]);
  pdf.text("maharera.mahaonline.gov.in", reraX + 10, reraY + 12);

  setDraw([0, 0, 0]);
  pdf.setLineWidth(0.15);
  pdf.line(0, 28, PAGE_W, 28);

  y = 33;

  // ── TITLE BLOCK ─────────────────────────────────────────────────────────
  pdf.setFontSize(17);
  pdf.setFont("helvetica", "bold");
  setColor(BLACK);
  pdf.text("Official Estimate Cost Sheet", MARGIN_L, y);
  y += 5;

  const floorLabel = selectedFloorNumber
    ? getOrdinalFloor(selectedFloorNumber)
    : "Typical Floors 7-22";
  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  setColor([51, 51, 51]);
  pdf.text(
    `${summary.items.length} Selected Unit${summary.items.length !== 1 ? "s" : ""} | ${floorLabel} | Date: ${getFormattedDate()}`,
    MARGIN_L,
    y
  );
  y += 5;

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  setColor(WARM);
  pdf.text("COMMERCIAL INVESTMENT BREAKDOWN", MARGIN_L, y + 2);
  y += 7;

  // ── UNITS TABLE ─────────────────────────────────────────────────────────
  needPage(16 + summary.items.length * 9 + 4);

  const colW: [number, number, number, number, number] = [20, 36, 28, 30, CONTENT_W - 20 - 36 - 28 - 30];
  const colX: [number, number, number, number, number] = [
    MARGIN_L,
    MARGIN_L + colW[0],
    MARGIN_L + colW[0] + colW[1],
    MARGIN_L + colW[0] + colW[1] + colW[2],
    MARGIN_L + colW[0] + colW[1] + colW[2] + colW[3],
  ];
  const headers = ["Unit No", "Carpet Area", "Rate (psf)", "Floor Rise", "Agreement Value"];

  setFill([215, 228, 240]);
  pdf.rect(MARGIN_L, y, CONTENT_W, 8, "F");
  setDraw([160, 180, 200]);
  pdf.setLineWidth(0.2);
  pdf.rect(MARGIN_L, y, CONTENT_W, 8, "D");

  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "bold");
  setColor(NAVY);
  headers.forEach((h, i) => {
    if (i === 4) {
      pdf.text(h, colX[i] + colW[i] - 2, y + 5.2, { align: "right" });
    } else {
      pdf.text(h, colX[i] + 2, y + 5.2);
    }
  });
  y += 8;

  summary.items.forEach((item, idx) => {
    needPage(9);
    const bg: [number, number, number] = idx % 2 === 0 ? WHITE : [247, 244, 240];
    setFill(bg);
    pdf.rect(MARGIN_L, y, CONTENT_W, 9, "F");
    setDraw([220, 215, 208]);
    pdf.setLineWidth(0.15);
    pdf.line(MARGIN_L, y + 9, MARGIN_L + CONTENT_W, y + 9);

    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "bold");
    setColor(BLACK);
    pdf.text(String(item.officeId), colX[0] + 2, y + 5.8);

    pdf.setFont("helvetica", "normal");
    pdf.text(`${fmt(item.carpetArea)} sq.ft`, colX[1] + 2, y + 5.8);
    pdf.text(`Rs.${fmt(item.rate)}`, colX[2] + 2, y + 5.8);
    pdf.text(idx === 0 ? `Rs.${fmt(summary.totalFloorRise)}` : "-", colX[3] + 2, y + 5.8);

    pdf.setFont("helvetica", "bold");
    pdf.text(`Rs.${fmt(item.basicCost)}`, colX[4] + colW[4] - 2, y + 5.8, { align: "right" });
    y += 9;
  });

  y += 5;

  // ── COST SUMMARY SLAB ───────────────────────────────────────────────────
  const slabItems: [string, string][] = [
    ["Combined Carpet Area", `${fmt(summary.totalCarpetArea)} sq.ft`],
    ["Basic Cost", `Rs.${fmt(summary.totalBasicCost)}`],
    ["Total Floor Rise", `Rs.${fmt(summary.totalFloorRise)}`],
    ["Development Charges", `Rs.${fmt(summary.totalDevelopment)}`],
    ["Legal & Society Formation", `Rs.${fmt(summary.totalLegal + summary.totalSocietyFormation + summary.totalRecreational)}`],
    ["Other Charges", `Rs.${fmt(summary.totalOtherCharges)}`],
    ["Electricity & Water Deposit", `Rs.${fmt(summary.totalDgBackup > 0 ? summary.totalDgBackup : 2500000)}`],
    ["Car Park", `${summary.items.length * 2} Nos. (Included)`],
  ];

  const slabCols = 4;
  const cellW = CONTENT_W / slabCols;
  const cellH = 14;
  const slabH = Math.ceil(slabItems.length / slabCols) * cellH + 2;

  needPage(slabH + 6);

  setFill(SLAB_BG);
  setDraw([200, 192, 180]);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(MARGIN_L, y, CONTENT_W, slabH, 2, 2, "FD");

  slabItems.forEach((item, i) => {
    const col = i % slabCols;
    const row = Math.floor(i / slabCols);
    const cx = MARGIN_L + col * cellW + 4;
    const cy = y + row * cellH + 6;

    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    setColor([31, 41, 51]);
    pdf.text(item[0], cx, cy);

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    setColor(BLACK);
    pdf.text(item[1], cx, cy + 6);
  });

  y += slabH + 5;

  // ── GRAND TOTAL PANEL ───────────────────────────────────────────────────
  const otherFees =
    summary.totalOtherCharges +
    summary.totalDevelopment +
    summary.totalLegal +
    summary.totalSocietyFormation +
    summary.totalRecreational;
  const elecDeposit = summary.totalDgBackup > 0 ? summary.totalDgBackup : 2500000;
  const maintenance = summary.totalCarpetArea * 100;

  const totalRows: [string, string][] = [
    ["Total Agreement Value", `Rs.${fmt(summary.totalBasicCost)}`],
    ["GST", `Rs.${fmt(summary.totalGst)}`],
    ["Maintenance", `Rs.${fmt(maintenance)}`],
    ["Other Charges / FSI / IFMS / Legal", `Rs.${fmt(otherFees)}`],
    ["Electricity & Water Deposit", `Rs.${fmt(elecDeposit)}`],
    ["Car Park", `${summary.items.length * 2} Nos. (Included)`],
  ];

  const panelH = totalRows.length * 8 + 14;
  needPage(panelH + 6);

  setFill(TOTAL_BG);
  setDraw([224, 180, 110]);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(MARGIN_L, y, CONTENT_W, panelH, 2, 2, "FD");

  let rowY = y + 8;
  totalRows.forEach(([label, value]) => {
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    setColor([17, 17, 17]);
    pdf.text(label, MARGIN_L + 4, rowY);
    pdf.text(value, MARGIN_L + CONTENT_W - 4, rowY, { align: "right" });
    rowY += 8;
  });

  // Dashed separator
  pdf.setLineDashPattern([1, 1], 0);
  setDraw([0, 0, 0]);
  pdf.setLineWidth(0.2);
  pdf.line(MARGIN_L + 4, rowY - 2, MARGIN_L + CONTENT_W - 4, rowY - 2);
  pdf.setLineDashPattern([], 0);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  setColor(WARM);
  pdf.text("FINAL GRAND TOTAL", MARGIN_L + 4, rowY + 6);

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  setColor(BLACK);
  pdf.text(`Rs.${fmt(summary.grandTotal)}`, MARGIN_L + CONTENT_W - 4, rowY + 6.5, { align: "right" });

  y += panelH + 6;

  // ── NOTES ───────────────────────────────────────────────────────────────
  const notes = [
    "Floor Rise Charges:- Rs 50 Psf Per Floor From 7th Floor Onwards.",
    "GST, Stamp Duty, Registration And Any Other Statutory Charges At Actuals.",
    "Above Quotation Is For Internal Discussion Only.",
    "MahaRERA no - P51700053764.",
    "Maintenance Charges at the time of possession.",
  ];
  const notesH = 10 + notes.length * 7;
  needPage(notesH + 4);

  setFill(LIGHT_BG);
  setDraw(BLACK);
  pdf.setLineWidth(0.3);
  pdf.rect(MARGIN_L, y, CONTENT_W, notesH, "FD");

  pdf.setFontSize(10);
  pdf.setFont("times", "bold");
  setColor(BLACK);
  pdf.text("NOTES:", PAGE_W / 2, y + 7, { align: "center" });
  pdf.setLineWidth(0.2);
  setDraw(BLACK);
  pdf.line(MARGIN_L, y + 9, MARGIN_L + CONTENT_W, y + 9);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  let noteY = y + 16;
  notes.forEach((note, i) => {
    pdf.text(`${i + 1}) ${note}`, MARGIN_L + 3, noteY);
    if (i < notes.length - 1) {
      pdf.setLineWidth(0.15);
      pdf.line(MARGIN_L, noteY + 3, MARGIN_L + CONTENT_W, noteY + 3);
    }
    noteY += 7;
  });

  y += notesH + 5;

  // ── DISCLAIMER ──────────────────────────────────────────────────────────
  needPage(14);
  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "normal");
  setColor([51, 51, 51]);
  const disclaimer =
    "Disclaimer: All specifications, drawing, amenities, facilities, parameters, etc., shown in this brochure are subject to change as per the approval from the respective authorities. The final discretion remains with the developers.";
  const disclaimerLines = pdf.splitTextToSize(disclaimer, CONTENT_W);
  pdf.text(disclaimerLines, MARGIN_L, y);

  // ── PAGE FOOTER ─────────────────────────────────────────────────────────
  const totalPages = (pdf as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    setDraw([180, 180, 180]);
    pdf.setLineWidth(0.15);
    pdf.line(MARGIN_L, PAGE_H - 8, PAGE_W - MARGIN_R, PAGE_H - 8);
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    setColor([130, 130, 130]);
    pdf.text("Level23 - Premium Office Spaces, Vashi, Navi Mumbai", MARGIN_L, PAGE_H - 5);
    pdf.text("www.level23.co.in", PAGE_W - MARGIN_R, PAGE_H - 5, { align: "right" });
  }

  return pdf.output("blob");
}
