import { OfficeCostData } from "@/types/costs";

// Default baseline fallback costs used when Google Sheets API is loading or offline
export const DEFAULT_OFFICE_COSTS: Record<string, OfficeCostData> = {
  // Key format: "floor_officeId" e.g. "10_1"
  "default": {
    floor: 0,
    unitNo: 0,
    rate: 17000,
    area: 1435,
    basicCost: 24395000,
    floorRise: 71750,
    developmentCharges: 717500,
    dgBackup: 287000,
    recreational: 287000,
    societyFormation: 143500,
    legal: 20000,
    otherCharges: 1000000,
    totalSubtotal: 26921750,
    gst: 3230610,
    stampDuty: 1615305,
    registration: 34000,
    grandTotal: 31801665,
  },
};

export function getFallbackCostForOffice(floor: number, officeId: number): OfficeCostData {
  const key = `${floor}_${officeId}`;
  if (DEFAULT_OFFICE_COSTS[key]) {
    return DEFAULT_OFFICE_COSTS[key];
  }
  
  // Create a somewhat accurate default matching typical row for Unit 1, Floor 7
  return {
    floor,
    unitNo: floor * 100 + officeId,
    rate: 17000,
    area: 1435,
    basicCost: 24395000,
    floorRise: 71750,
    developmentCharges: 717500,
    dgBackup: 287000,
    recreational: 287000,
    societyFormation: 143500,
    legal: 20000,
    otherCharges: 1000000,
    totalSubtotal: 26921750,
    gst: 3230610,
    stampDuty: 1615305,
    registration: 34000,
    grandTotal: 31801665,
  };
}
