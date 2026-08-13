import { OfficeCostData } from "@/types/costs";
import { DEFAULT_OFFICE_COSTS } from "@/data/defaultCosts";

export async function fetchLiveCostMap(): Promise<Record<string, OfficeCostData>> {
  const sheetCsvUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_CSV_URL || "https://docs.google.com/spreadsheets/d/e/2PACX-1vSEXSNH5U5wDR-XJsoed4h2qV9DfNG63_trL67fzaMUUd95MS_fbb6W5gMl7f-1iDmBxwqwozQVJl6F/pub?output=csv";

  if (!sheetCsvUrl) {
    return DEFAULT_OFFICE_COSTS;
  }

  try {
    const res = await fetch(`${sheetCsvUrl}&t=${Date.now()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Google Sheet HTTP error ${res.status}`);
    }

    const csvText = await res.text();
    const rows = parseCsv(csvText);

    const costMap: Record<string, OfficeCostData> = {};

    let headerRowIndex = -1;
    let headerRow: string[] = [];

    // Search the first few rows for the actual header
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const h = rows[i].map((c) => c.toLowerCase().trim());
      if (h.includes("floor") && h.includes("unit no") && h.includes("rate")) {
        headerRowIndex = i;
        headerRow = h;
        break;
      }
    }

    if (headerRowIndex === -1) {
      headerRow = rows[0] ? rows[0].map((h) => h.toLowerCase().trim()) : [];
      headerRowIndex = 0;
    }

    const carpetAreaIndex = headerRow.findIndex((h) => h.includes("carpet"));
    const parkingVarIndex = headerRow.findIndex((h) => h === "parking variable");

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 16) continue;

      const floor = parseInt(row[0], 10);
      const unitNo = parseInt(row[1], 10);
      const rate = parseFloat(row[2]) || 0;
      const area = parseFloat(row[3]) || 0;
      const carpetAreaVal = carpetAreaIndex !== -1 ? parseFloat(row[carpetAreaIndex]) : undefined;
      const basicCost = parseFloat(row[4]) || 0;
      const floorRise = parseFloat(row[5]) || 0;
      const developmentCharges = parseFloat(row[6]) || 0;
      const dgBackup = parseFloat(row[7]) || 0;
      const recreational = parseFloat(row[8]) || 0;
      const societyFormation = parseFloat(row[9]) || 0;
      const legal = parseFloat(row[10]) || 0;
      const otherChargesBase = parseFloat(row[11]) || 0;
      
      let parkingVariable = 1;
      if (parkingVarIndex !== -1 && row[parkingVarIndex] !== undefined) {
        const pv = parseFloat(row[parkingVarIndex]);
        if (!isNaN(pv)) {
          parkingVariable = pv;
        }
      }
      const otherCharges = otherChargesBase * parkingVariable;

      // Handle column shift if Parking Variable was inserted after Other Charges (which is at index 11)
      const offset = (parkingVarIndex !== -1 && parkingVarIndex <= 12) ? 1 : 0;

      const totalSubtotal = parseFloat(row[12 + offset]) || 0;
      const gst = parseFloat(row[13 + offset]) || 0;
      const stampDuty = parseFloat(row[14 + offset]) || 0;
      const registration = parseFloat(row[15 + offset]) || 0;
      const grandTotal = parseFloat(row[16 + offset]) || 0;

      if (!isNaN(floor) && !isNaN(unitNo)) {
        const officeId = unitNo % 100;
        const key = `${floor}_${officeId}`;
        
        costMap[key] = {
          floor,
          unitNo,
          rate,
          area,
          carpetArea: !isNaN(carpetAreaVal!) ? carpetAreaVal : undefined,
          basicCost,
          floorRise,
          developmentCharges,
          dgBackup,
          recreational,
          societyFormation,
          legal,
          otherCharges,
          parkingVariable,
          totalSubtotal,
          gst,
          stampDuty,
          registration,
          grandTotal,
        };
      }
    }

    if (Object.keys(costMap).length === 0) {
      return DEFAULT_OFFICE_COSTS;
    }

    return costMap;
  } catch (error) {
    console.error("Failed to fetch live costs:", error);
    return DEFAULT_OFFICE_COSTS;
  }
}

function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/);
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim()));
}
