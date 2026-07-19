import type { FloorGroup } from "@/types/floor";

export const floorGroups: FloorGroup[] = [
  {
    id: "ground",
    short: "G",
    label: "Retail",
    title: "Ground Floor",
    description: "Retail frontage, arrival lobby and vehicular circulation.",
    plan: "/images/plans/ground-plan.webp",
  },
  {
    id: "first",
    short: "1",
    label: "Offices",
    title: "First Floor Offices",
    description: "Commercial office units arranged around the central lift core.",
    plan: "/images/plans/first-plan.webp",
  },
  {
    id: "parking",
    short: "2–4",
    label: "Parking",
    title: "Parking Levels",
    description: "Parking layouts, driveways and robotic parking provisions.",
    plan: "/images/plans/parking-plan.webp",
  },
  {
    id: "amenities",
    short: "6",
    label: "Amenities",
    title: "Amenities Floor",
    description: "Conference rooms, gym, cafeteria, indoor games and landscaped lawns.",
    plan: "/images/plans/amenities-plan.webp",
  },
  {
    id: "offices",
    short: "7–22",
    label: "Typical",
    title: "Typical Office Floors",
    description: "Flexible commercial offices across the typical tower floors.",
    plan: "/images/plans/typical-plan.webp",
  },
  {
    id: "premium",
    short: "23",
    label: "Terrace",
    title: "Premium Top Floor",
    description: "Larger offices with expansive open-to-sky terrace areas.",
    plan: "/images/plans/premium-plan.webp",
  },
];
