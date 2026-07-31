import { Office } from "@/types/unit";
import { OfficeCostData, SelectedOfficeCostBreakdown, CostSheetSummary } from "@/types/costs";
import { getFallbackCostForOffice } from "@/data/defaultCosts";

export function calculateCostSheet(
  selectedOffices: Office[],
  selectedFloorNumber: number | null,
  costMap: Record<string, OfficeCostData> = {}
): CostSheetSummary {
  const floor = selectedFloorNumber || 7;
  
  const items: SelectedOfficeCostBreakdown[] = selectedOffices.map((office) => {
    const key = `${floor}_${office.id}`;
    const pricing = costMap[key] || getFallbackCostForOffice(floor, office.id);

    return {
      officeId: office.id,
      ...pricing
    };
  });

  const totalArea = items.reduce((acc, item) => acc + item.area, 0);
  const totalBasicCost = items.reduce((acc, item) => acc + item.basicCost, 0);
  const totalFloorRise = items.reduce((acc, item) => acc + item.floorRise, 0);
  const totalDevelopment = items.reduce((acc, item) => acc + item.developmentCharges, 0);
  const totalDgBackup = items.reduce((acc, item) => acc + item.dgBackup, 0);
  const totalRecreational = items.reduce((acc, item) => acc + item.recreational, 0);
  const totalSocietyFormation = items.reduce((acc, item) => acc + item.societyFormation, 0);
  const totalLegal = items.reduce((acc, item) => acc + item.legal, 0);
  const totalOtherCharges = items.reduce((acc, item) => acc + item.otherCharges, 0);
  const totalSubtotal = items.reduce((acc, item) => acc + item.totalSubtotal, 0);
  const totalGst = items.reduce((acc, item) => acc + item.gst, 0);
  const totalStampDuty = items.reduce((acc, item) => acc + item.stampDuty, 0);
  const totalRegistration = items.reduce((acc, item) => acc + item.registration, 0);
  const grandTotal = items.reduce((acc, item) => acc + item.grandTotal, 0);

  return {
    items,
    totalArea,
    totalBasicCost,
    totalFloorRise,
    totalDevelopment,
    totalDgBackup,
    totalRecreational,
    totalSocietyFormation,
    totalLegal,
    totalOtherCharges,
    totalSubtotal,
    totalGst,
    totalStampDuty,
    totalRegistration,
    grandTotal,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
