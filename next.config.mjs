/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // domains: ["ayva-hub.s3.ap-south-1.amazonaws.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ayva-hub.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**/*",
      },
    ],
  },
};

export default nextConfig;
