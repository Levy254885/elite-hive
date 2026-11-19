/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/privacy", destination: "/terms#part-b-privacy-policy", permanent: true },
      { source: "/privacy-policy", destination: "/terms#part-b-privacy-policy", permanent: true },
      { source: "/terms-of-use", destination: "/terms", permanent: true },
    ];
  },
};
export default nextConfig;
