import type { Office } from "@/types/unit";
import { PLAN_WIDTH, PLAN_HEIGHT } from "@/constants/plan";

const officeSpecs: Record<number, { area: number; carpet: number; dimensions: string }> = {
  1830: { area: 1830, carpet: 915.725, dimensions: `19'8\" × 47'9\"` },
  1370: { area: 1370, carpet: 685.376, dimensions: `14'9\" × 47'9\"` },
  1435: { area: 1435, carpet: 716.899, dimensions: `15'5\" × 47'9\"` },
  1510: { area: 1510, carpet: 755.062, dimensions: `16'3\" × 47'9\"` },
  1700: { area: 1700, carpet: 849.032, dimensions: `18'2\" × 47'9\"` },
  1600: { area: 1600, carpet: 799.7, dimensions: `17'2\" × 47'9\"` },
  1565: { area: 1565, carpet: 782.747, dimensions: `17'2\" × 47'9\"` },
};

const officeBounds = {
  top: {
    y1: 18,
    y2: 338,
    boundaries: [24, 161, 264, 372, 478, 580, 681, 788, 890, 1010, 1122, 1225, 1326, 1428, 1531, 1635, 1738],
    ids: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    areas: [1830, 1370, 1370, 1435, 1435, 1435, 1510, 1510, 1700, 1700, 1435, 1435, 1435, 1600, 1600, 1565],
  },
  bottomLeft: {
    y1: 409,
    y2: 768,
    boundaries: [24, 161, 260, 372, 463, 563],
    ids: [5, 4, 3, 2, 1],
    areas: [1830, 1370, 1370, 1435, 1435],
  },
  bottomRight: {
    y1: 409,
    y2: 768,
    boundaries: [1205, 1305, 1412, 1527, 1635, 1738],
    ids: [26, 25, 24, 23, 22],
    areas: [1435, 1435, 1600, 1600, 1565],
  },
} as const;

const makeOfficeFromPixels = (id: number, area: number, x1: number, x2: number, y1: number, y2: number): Office => ({
  id,
  area,
  carpetArea: officeSpecs[area].carpet,
  dimensions: officeSpecs[area].dimensions,
  x: (x1 / PLAN_WIDTH) * 100,
  y: (y1 / PLAN_HEIGHT) * 100,
  w: ((x2 - x1) / PLAN_WIDTH) * 100,
  h: ((y2 - y1) / PLAN_HEIGHT) * 100,
  facing: id <= 5 || id >= 22 ? "Road-facing" : "Window-facing",
});

const buildOfficeRow = (row: typeof officeBounds.top | typeof officeBounds.bottomLeft | typeof officeBounds.bottomRight) =>
  row.ids.map((id, index) =>
    makeOfficeFromPixels(id, row.areas[index], row.boundaries[index], row.boundaries[index + 1], row.y1, row.y2),
  );

export const offices: Office[] = [
  ...buildOfficeRow(officeBounds.top),
  ...buildOfficeRow(officeBounds.bottomLeft),
  ...buildOfficeRow(officeBounds.bottomRight),
];
