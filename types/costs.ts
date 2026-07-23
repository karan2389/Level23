export interface OfficeCostData {
  floor: number;
  unitNo: number; // e.g. 701, 702
  rate: number;
  area: number;
  basicCost: number;
  floorRise: number;
  developmentCharges: number;
  dgBackup: number;
  recreational: number;
  societyFormation: number;
  legal: number;
  otherCharges: number;
  totalSubtotal: number;
  gst: number;
  stampDuty: number;
  registration: number;
  grandTotal: number;
}

export interface SelectedOfficeCostBreakdown extends OfficeCostData {
  officeId: number; // 1 to 26
}

export interface CostSheetSummary {
  items: SelectedOfficeCostBreakdown[];
  totalArea: number;
  totalBasicCost: number;
  totalFloorRise: number;
  totalDevelopment: number;
  totalDgBackup: number;
  totalRecreational: number;
  totalSocietyFormation: number;
  totalLegal: number;
  totalOtherCharges: number;
  totalSubtotal: number; // Agreement Value
  totalGst: number;
  totalStampDuty: number;
  totalRegistration: number;
  grandTotal: number;
}
