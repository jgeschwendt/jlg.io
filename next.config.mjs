/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': { as: '*.js', loaders: ['@svgr/webpack'] },
      },
    },
  },
};

export default config;
