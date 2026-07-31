export function getOfficeFacing(officeId: number): string {
  if (officeId >= 1 && officeId <= 5) return "Sea Facing";
  if (officeId >= 6 && officeId <= 21) return "City Facing";
  if (officeId >= 22 && officeId <= 26) return "Sea Facing";
  return "Unknown";
}
