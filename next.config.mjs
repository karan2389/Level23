/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generate a fully static site in /out so Netlify can serve it without
  // serverless functions or the Next.js runtime adapter.
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
