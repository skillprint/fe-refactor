import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js optimizations for images (it's not available for static sites
    // and will throw an error)
    unoptimized: true,
  },

  // This tells Next.js to export a static build to the `out` folder


  // This tells Next.js to export pages as "folders with an `index.html` file inside"
  // We use this option so we can avoid having the `.html` extension at the end of the page URLs.
  trailingSlash: true,

  // SKI-144: the profile skill breakdown used to link to /profile/skills/<slug>,
  // which never had a route. Keep old links (bookmarks, the bug tracker) working.
  async redirects() {
    return [
      {
        source: '/profile/skills/:slug',
        destination: '/skills/:slug',
        permanent: true,
      },
    ];
  },

  // Rewrites for development to proxy API requests and avoid CORS
  // Note: These won't work in the static export, but help during development
  async rewrites() {
    // if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') {
    //   return [
    //     {
    //       source: '/api/:path*',
    //       destination: 'https://api.staging.skillprint.co/:path*',
    //     },
    //   ];
    // }

    return [];
  },
};

export default nextConfig;
