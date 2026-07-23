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

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 16) continue;

      const floor = parseInt(row[0], 10);
      const unitNo = parseInt(row[1], 10);
      const rate = parseFloat(row[2]) || 0;
      const area = parseFloat(row[3]) || 0;
      const basicCost = parseFloat(row[4]) || 0;
      const floorRise = parseFloat(row[5]) || 0;
      const developmentCharges = parseFloat(row[6]) || 0;
      const dgBackup = parseFloat(row[7]) || 0;
      const recreational = parseFloat(row[8]) || 0;
      const societyFormation = parseFloat(row[9]) || 0;
      const legal = parseFloat(row[10]) || 0;
      const otherCharges = parseFloat(row[11]) || 0;
      const totalSubtotal = parseFloat(row[12]) || 0;
      const gst = parseFloat(row[13]) || 0;
      const stampDuty = parseFloat(row[14]) || 0;
      const registration = parseFloat(row[15]) || 0;
      const grandTotal = parseFloat(row[16]) || 0;

      if (!isNaN(floor) && !isNaN(unitNo)) {
        const officeId = unitNo % 100;
        const key = `${floor}_${officeId}`;
        
        costMap[key] = {
          floor,
          unitNo,
          rate,
          area,
          basicCost,
          floorRise,
          developmentCharges,
          dgBackup,
          recreational,
          societyFormation,
          legal,
          otherCharges,
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
