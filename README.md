# Level23 Update 02 - Cosmetic Refresh

This is an **update-only patch**, not a full project. Apply it to the latest Level23 codebase that already contains the updated typical-floor image and accurate office selection grids.

## 🚫 Do Not Modify

The following folders/files are outside the scope of this patch and must not be edited:

- data/
- providers/
- utils/
- constants/
- components/unit/
- components/building/

Do not:
- refactor
- rename files
- change imports
- update dependencies
- change routing
- regenerate components
- modify business logic
- alter state management

## Scope

This patch changes presentation only:

- Rebuilds the first hero screen to follow the supplied mobile mockup.
- Uses the supplied daytime Level23 building render as the hero image.
- Adds Akshar, Bhagwati and Level23 branding to the transparent navbar.
- Replaces the warm orange/cream interface with a blue-glass, silver, mist and warm-sunrise palette derived from the supplied building render.
- Adds a soft blurred building/gradient atmosphere behind the site sections.
- Adds the full sales-office, phone, email, website, MahaRERA and disclaimer information to the bottom of the final page.
- Does **not** add the QR code.

## Important functional constraint

Do not modify or regenerate the existing project logic. The following must remain exactly as they currently work:

- 3D building interaction
- floor-range switching
- floor-plan zoom, drag, pinch and reset
- all office hotspots and hotspot coordinates
- single-office popup
- multiple-office selection
- cost sheet
- enquiry workflow
- Google Sheet pricing integration

No files inside `data/`, `providers/`, `utils/`, `components/unit/`, `components/building/`, or `constants/` are part of this update.

## Installation procedure

1. Create a backup or a new Git branch before applying the update.
2. Open the `patch` folder in this package.
3. Copy everything inside `patch/` into the Level23 project root.
4. Preserve the folder structure exactly.
5. Allow these files to be replaced:
   - `app/globals.css`
   - `app/layout.tsx`
   - `components/common/Header.tsx`
   - `components/hero/HeroSection.tsx`
   - `components/contact/LocationSection.tsx`
   - `public/images/logos/akshar.png`
   - `public/images/logos/bhagwati.png`
   - `public/images/logos/level23.png`
6. Add the new files:
   - `public/images/building/level23-hero-main.jpeg`
   - `public/images/logos/akshar-footer-original.png`
   - `public/images/logos/bhagwati-footer-original.png`
7. Run:

```bash
npm install
npm run build
npm run dev
```

8. Verify the checklist below before committing.

## Visual result expected

### Transparent navbar

- Akshar and Bhagwati appear together on the left with a thin divider.
- The footer uses cropped copies of the exact supplied black-background logo masters; only empty outer margins were removed.
- Level23 appears in the centre.
- The menu icon remains on the right.
- The navbar remains transparent with a very light blur, not a solid block.

### Hero

- The supplied daytime building render fills the first screen.
- Level23 branding, the heading `Beyond Premium Offices`, supporting copy and `Explore Spaces` button sit on the left.
- A dark bottom fade keeps the swipe-up instruction readable.
- Mobile cropping keeps the tower prominent while retaining readable left-side copy.

### Site palette

- Main colors: glass blue, silver, slate navy, mist white and restrained warm copper.
- Existing cards become translucent blue-glass cards.
- A blurred version of the building render creates subtle depth behind subsequent sections.
- The refresh must not reduce plan readability or hotspot visibility.

### Final-page footer

Add these details without a QR code:

- **Sales Office Address:** Next to Abbott Hotel, Plot No. 22, 23, 32 & 33, Sector - 2, Vashi, Navi Mumbai - 400 703
- **Phone:** 73530 31888
- **Email:** info@level23.co.in
- **Website:** www.level23.co.in
- **MahaRERA Reg. No.:** P51700053764
- **MahaRERA website:** https://maharera.mahaonline.gov.in
- **Disclaimer:** All specifications, drawing, amenities, facilities, parameters, etc., shown in this brochure are subject to change as per the approval from the respective authorities. The final discretion remains with the developers.

## Verification checklist

- [ ] Hero loads the new `level23-hero-main.jpeg` asset.
- [ ] Hero copy is readable at 360 px, 390 px, 768 px and desktop widths.
- [ ] Header logos do not overlap the menu.
- [ ] Header stays transparent.
- [ ] Level23 logo is visible in the centre of the navbar.
- [ ] Floor-plan image is unchanged.
- [ ] All 26 typical-office hotspots still align and select correctly.
- [ ] Floor switching still works.
- [ ] Single and multiple office selection still work.
- [ ] Cost sheet and enquiry modal still open.
- [ ] Footer displays all supplied information.
- [ ] No QR code appears anywhere in the new footer.
- [ ] `npm run build` succeeds before deployment.

## Files included

```text
patch/
├── app/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── common/Header.tsx
│   ├── contact/LocationSection.tsx
│   └── hero/HeroSection.tsx
└── public/images/
    ├── building/level23-hero-main.jpeg
    └── logos/
        ├── akshar.png
        ├── akshar-footer-original.png
        ├── bhagwati.png
        ├── bhagwati-footer-original.png
        └── level23.png
```

## Build-validation note

The TypeScript files were syntax-checked. A complete dependency installation and Next.js build could not be performed in the packaging environment because its internal npm mirror returned a 404 for `zustand@5.0.14`. The developer must run the normal project build after applying the patch.
