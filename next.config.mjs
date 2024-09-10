/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
      config.resolve.alias['@'] = path.join(__dirname, 'src');
      return config;
    },
    env: {
      MONGODB_URI: process.env.MONGODB_URI,
    }
};

export default nextConfig;

