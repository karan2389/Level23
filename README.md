# Monopoly Interactive Building Portfolio

A mobile-first commercial property portfolio built with Next.js, TypeScript, GSAP and React Three Fiber.

## Included

- Animated premium hero section
- Smooth scroll/fade transitions using GSAP ScrollTrigger
- Interactive lightweight 3D building model with orbit, zoom and automatic rotation
- Clickable floor groups
- Ground, first-floor, parking, amenities, typical-office and premium-floor plans
- Clickable office hotspots on the typical plan
- Dynamic office detail section
- Indicative interior-layout gallery
- Google Maps embed and directions link
- Downloadable source PDF
- Placeholder flow for cost sheet, contact details and availability
- Responsive mobile, tablet and desktop layouts
- Fully static Next.js export for Netlify

## Run locally

Use Node.js 20.9 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm run preview
```

The static site is generated in `out/` and can be served by Netlify or any static host.

## Netlify

See `NETLIFY-DEPLOY.md`.

For a Git-based Netlify deployment, the included `netlify.toml` sets:

- Build command: `npm run build`
- Publish directory: `out`
- Node version: `20.19.4`

For Netlify Drop/manual deployment, use the separately packaged deploy-ready ZIP whose root contains `index.html`.

## Important demo notes

- The 3D building is a lightweight illustrative approximation created in code because a production GLB/GLTF building model was not supplied.
- Exact carpet/saleable classifications, office availability, contact numbers, WhatsApp links and cost sheets must be confirmed by the builder.
- Update project data in `data/project.ts`.
- Update contact actions in `components/PortfolioSite.tsx`.
- Replace the coded 3D model in `components/BuildingModel.tsx` with a Spline embed or GLB model later if one becomes available.
