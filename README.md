# Level23 Update 03 - Mobile Page Navigation and Floor Plan UI

## Baseline

Apply this patch only to the latest complete `Level23-main` project supplied on 2 August 2026. This package contains update-only replacement files. It is not a complete project.

## Safe application procedure

1. Make a backup or create a new Git branch.
2. Open the current Level23 project root.
3. Copy everything inside `changed-files/` into the project root.
4. Preserve the folder paths exactly.
5. Replace only files that already exist.
6. Add the new file:
   `components/common/MainPageNavigation.tsx`
7. Do not delete, move, rename or rewrite any other file.
8. Run:

```bash
npm ci
npm run build
```

The same changes are also provided in `CODE-REVIEW-DIFF.patch` for review. The replacement files are the preferred Antigravity workflow.

## Required changes included

### Correct office facing

- Offices 01-05: City Facing
- Offices 06-21: Sea Facing
- Offices 22-26: City Facing

The internal office data and the displayed facing helper have both been corrected. Existing overlay layout and scrolling remain unchanged.

### Remove the temporary text-based Level 23 mark

The minimalist tower-glyph `LEVEL 23` mark has been removed from all main pages. The navigation menu now uses the supplied original Level23 logo image instead.

### Floor-plan heading instruction

The Floor Plan heading now includes:

> Choose a floor plan, then tap an office to view its details.

### Compact 3D explorer on mobile

The building model and all six floor-range buttons are designed to fit in one mobile viewport. Buttons are smaller without changing their selection behavior.

Parking is corrected from `2-4` to `2-5`.

### Floor-plan toolbar

- Removed the full-screen/reset icon with two diagonal arrows.
- Kept zoom-in and zoom-out.
- Moved the plan instruction above the plan and into the same row as the zoom controls.
- Kept drag, pinch, wheel zoom and double-tap reset behavior.

### Six mobile main pages

Mobile main-page order:

1. Hero
2. 3D Building Explorer
3. Floor Plan
4. Interiors
5. Location
6. Contact and legal footer

The previous combined Location/Contact section has only been split into two main screen sections. Its content, links, logos and legal text are preserved.

### Page-by-page mobile navigation

On screens up to 900 px wide:

- Free scrolling between main sections is replaced by one-page navigation.
- One upward swipe moves directly to the next page.
- One downward swipe moves directly to the previous page.
- The bottom control reads `Swipe Up / Go Down`.
- The top control reads `Swipe Down / Go Up`.
- Both controls are clickable.
- The hero only shows the next-page control.
- The final Contact page only shows the previous-page control.

Interactive areas are excluded from page gestures so these continue working:

- 3D building rotation and zoom
- Floor-plan pan and zoom
- Buttons, links, dropdowns and forms
- Navigation menu
- Office details overlay
- Multiple-office summary overlay
- Enquiry and cost-sheet overlays

Overlay pages continue to use their existing internal free scrolling.

### Header and progress control

- Header remains fixed and visible across all six main pages.
- A stronger top-to-transparent gradient has been added.
- The right-side vertical progress-dot control has been removed from the rendered site.

## Files intentionally not changed

Do not modify these systems while applying this patch:

- Office hotspot coordinates
- Floor-plan images or other public assets
- Office single-selection behavior
- Multiple-office selection logic
- Pricing and Google Sheet integration
- Cost calculations and cost-sheet PDF generation
- Enquiry API or form logic
- 3D model geometry and materials
- Overlay layout or overlay scrolling
- Netlify configuration
- Dependencies or package versions

## Mobile verification checklist

Test at least these viewport sizes:

- 360 x 640
- 390 x 844
- 412 x 915

Confirm:

1. Exactly six main screen sections are reachable.
2. Each swipe changes only one page.
3. Swipe down returns to the previous page.
4. Header remains visible.
5. No right-side progress dots appear.
6. The model and six floor buttons fit on the Explorer page.
7. Parking reads `2-5`.
8. The Floor Plan page shows the new heading instruction.
9. The plan instruction and zoom controls are on one row.
10. No full-screen/two-arrow plan control appears.
11. Plan pinch, drag, wheel zoom and office hotspots still work.
12. Office facing matches the required ranges.
13. Office, multiple-office, enquiry and cost-sheet overlays retain free scrolling.
14. Location content is on Page 5 and the complete contact/footer content is on Page 6.

## Validation performed before packaging

- TypeScript syntax transpile check passed for all 15 modified/new TypeScript files.
- CSS opening/closing brace and parenthesis counts match.
- A full Next.js build could not be run in the packaging environment because its internal npm mirror returns a 404 for `zustand@5.0.14`. Run the normal build in the developer environment after applying the files.
