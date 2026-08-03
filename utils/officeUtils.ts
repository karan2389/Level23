export function getOfficeFacing(officeId: number): string {
  if (officeId >= 1 && officeId <= 5) return "City Facing";
  if (officeId >= 6 && officeId <= 21) return "Sea Facing";
  if (officeId >= 22 && officeId <= 26) return "City Facing";
  return "Unknown";
}

/**
 * Formats floor and office ID into a standard Unit Number (e.g., Floor 7, Office 1 => "701", Floor 15, Office 3 => "1503").
 */
export function formatUnitNumber(floor: number | null | undefined, officeId: number | string): string {
  const f = floor || 7;
  const officeNum = typeof officeId === "number" ? officeId : parseInt(String(officeId), 10);
  const paddedOffice = isNaN(officeNum) ? String(officeId) : String(officeNum).padStart(2, "0");
  return `${f}${paddedOffice}`;
}
