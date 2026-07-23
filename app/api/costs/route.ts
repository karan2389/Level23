import { NextResponse } from "next/server";
import { OfficeCostData } from "@/types/costs";
import { DEFAULT_OFFICE_COSTS } from "@/data/defaultCosts";

// Next.js ISR: Revalidate Google Sheet data every 60 seconds
export const revalidate = 60;

export async function GET() {
  const sheetCsvUrl = process.env.GOOGLE_SHEET_CSV_URL;

  if (!sheetCsvUrl) {
    // Return default fallback costs if environment variable is not configured yet
    return NextResponse.json({
      success: true,
      source: "default_fallback",
      data: DEFAULT_OFFICE_COSTS,
    });
  }

  try {
    const res = await fetch(sheetCsvUrl, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Google Sheet HTTP error ${res.status}`);
    }

    const csvText = await res.text();
    const rows = parseCsv(csvText);

    const costMap: Record<string, OfficeCostData> = {};

    // Header row expected based on live CSV:
    // FLOOR, UNIT NO, RATE, AREA, BASIC, FLOOR RISE, DEVELOPMENT CHARGES, D G BACKUP, RECREATIONAL FACILITES, SOCIETY FORMATION, LEGAL, OTHER CHARGES, TOTAL, GST, STAMP DUTY, REGISTRATION, GRAND TOTAL
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
        // Derive office ID from unit no (e.g. 701 -> 1, 1012 -> 12)
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

    // Check if empty, fallback to default
    if (Object.keys(costMap).length === 0) {
       throw new Error("No valid rows parsed from Google Sheet CSV");
    }

    return NextResponse.json({
      success: true,
      source: "google_sheets",
      data: costMap,
    });
  } catch (error) {
    console.error("Failed to fetch Google Sheet costs:", error);
    return NextResponse.json(
      {
        success: false,
        source: "default_fallback_error",
        error: String(error),
        data: DEFAULT_OFFICE_COSTS,
      },
      { status: 200 } // Soft fallback to prevent UI breakage
    );
  }
}

function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/);
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim()));
}
