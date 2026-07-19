# Netlify deployment

This project is configured as a fully static Next.js export.

## Fastest method: Netlify Drop / manual upload

Use the separate `monopoly-building-portfolio-netlify-upload.zip` package. It already contains the generated static site with `index.html` at the ZIP root.

1. Open Netlify and choose **Deploy manually** / **Netlify Drop**.
2. Upload the deploy-ready ZIP, or extract it and drag the extracted folder.
3. Do not upload the source-code ZIP to the manual deploy area.

## Git repository method

Use the source project in this package.

1. Push the project root to GitHub, GitLab, or Bitbucket.
2. Import the repository in Netlify.
3. Netlify reads `netlify.toml` automatically.

Build settings are already defined:

- Build command: `npm run build`
- Publish directory: `out`
- Node: `20.19.4`

## Local verification

```bash
npm ci
npm run build
npm run preview
```

Then open `http://localhost:4173`.

## Why the older ZIP could fail

The original lock file was not synchronized with `package.json`, so clean installs using `npm ci` failed. The lock file has now been regenerated. The project also now includes explicit Netlify build settings and a ready-made static upload package.
