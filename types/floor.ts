export type FloorGroupId = "ground" | "first" | "parking" | "amenities" | "offices" | "premium";

export type FloorGroup = {
  id: FloorGroupId;
  short: string;
  label: string;
  title: string;
  description: string;
  plan: string;
};
