# Project Editing Notes

## Main content files

- `data/project.ts` — floor groups, office areas, dimensions, hotspot positions and interior gallery.
- `components/PortfolioSite.tsx` — page sections, GSAP animations, buttons, map and placeholder contact flow.
- `components/BuildingModel.tsx` — lightweight interactive 3D building.
- `app/globals.css` — complete responsive styling.

## Replace later

1. Replace the illustrative coded building with the builder's `.glb`, `.gltf`, or Spline scene when supplied.
2. Add confirmed phone, email and WhatsApp links.
3. Add confirmed cost sheets and office availability.
4. Confirm whether the displayed values are carpet, built-up, chargeable or saleable areas.
5. Confirm final parking level naming and capacities.
6. Add official RERA and legal disclaimer text.

## 3D replacement options

- **Spline:** replace the `BuildingModel` dynamic component with a Spline viewer/embed.
- **GLB/GLTF:** retain React Three Fiber and load the model with `useGLTF` from `@react-three/drei`.

## Floor hotspot editing

Office hotspot percentages are stored in `data/project.ts`. Each office has `x`, `y`, `w`, and `h` values measured as percentages of the typical-plan image.

## Interaction update — v2.1

- Added native two-finger pinch zoom to the 3D building while preventing browser-page zoom inside the model.
- Added drag, wheel, button and two-finger pinch zoom to every floor plan.
- Replaced the rotated typical plan with the accurate horizontal source plan.
- Recalibrated every selectable office hotspot to the actual pixel boundaries in the supplied plan.
- Removed the separate office-details page and large repeated plan preview.
- Office selection now opens a responsive popup containing a cropped image of the exact selected unit, core details, pricing placeholder and enquiry actions.
