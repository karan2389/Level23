# Next.js Architecture Refactor Walkthrough

The project has been successfully refactored to align with enterprise-level architecture guidelines.

> [!SUCCESS]
> **Functional Parity Maintained**
> Visual design, UI, animations, React Three Fiber components, layouts, and all core logic remain exactly identical.

## Changes Made

### 1. Types Organization
Removed all inline types from `project.ts` and separated them into a dedicated `types/` folder:
- [types/floor.ts](file:///c:/Users/karan/Downloads/DEMO3 NextJS/types/floor.ts): `FloorGroupId`, `FloorGroup`
- [types/unit.ts](file:///c:/Users/karan/Downloads/DEMO3 NextJS/types/unit.ts): `Office`

### 2. Data Splitting
Eliminated the monolithic `data/project.ts` (subsequently deleted) and segregated the content into cohesive files under the `data/` directory:
- [data/floors.ts](file:///c:/Users/karan/Downloads/DEMO3 NextJS/data/floors.ts): Contains the array of all building floors.
- [data/units.ts](file:///c:/Users/karan/Downloads/DEMO3 NextJS/data/units.ts): Contains the `offices` array and bounding logic.
- [data/interiors.ts](file:///c:/Users/karan/Downloads/DEMO3 NextJS/data/interiors.ts): Contains the image paths for the workspace layouts.

### 3. Centralized Constants
Extracted magic numbers out of the components:
- [constants/scene.ts](file:///c:/Users/karan/Downloads/DEMO3 NextJS/constants/scene.ts): Contains rotation multipliers, dampening speeds, etc.
- [constants/plan.ts](file:///c:/Users/karan/Downloads/DEMO3 NextJS/constants/plan.ts): Contains the base aspect ratio and coordinate lengths for the interactive SVG plans.

### 4. Component Refactoring
Broke down the massive 430-line `PortfolioSite.tsx` into domain-focused components:
- **Hero**: [HeroSection.tsx](file:///c:/Users/karan/Downloads/DEMO3 NextJS/components/hero/HeroSection.tsx)
- **Building Explorer**: [BuildingScene.tsx](file:///c:/Users/karan/Downloads/DEMO3 NextJS/components/building/BuildingScene.tsx)
- **Floor Plans**: [PlanViewer.tsx](file:///c:/Users/karan/Downloads/DEMO3 NextJS/components/unit/PlanViewer.tsx) & [UnitPanel.tsx](file:///c:/Users/karan/Downloads/DEMO3 NextJS/components/unit/UnitPanel.tsx)
- **Interiors**: [InteriorsSection.tsx](file:///c:/Users/karan/Downloads/DEMO3 NextJS/components/interiors/InteriorsSection.tsx)
- **Location & Contact**: [LocationSection.tsx](file:///c:/Users/karan/Downloads/DEMO3 NextJS/components/contact/LocationSection.tsx)
- **Navigation**: [NavigationMenu.tsx](file:///c:/Users/karan/Downloads/DEMO3 NextJS/components/navigation/NavigationMenu.tsx)
- **Common Elements**: `Header.tsx`, `LevelMark.tsx`, `NoticeModal.tsx`

### 5. Animation Extraction
GSAP logic was removed from the top-level container and placed inside [animations/scroll.ts](file:///c:/Users/karan/Downloads/DEMO3 NextJS/animations/scroll.ts) to manage the scroll triggers cleanly.

## Validation Results

- The build command `npm run build` compiled cleanly.
- `npm run lint` completed with 0 errors.
- Typescript (`tsc`) checked perfectly.

The production-ready folder architecture is fully implemented!
