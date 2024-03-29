/** @type {import('next').NextConfig} */
const config = {
  webpack(config) {
    const imageLoader = config.module.rules.findIndex(
      ({ loader }) => loader === 'next-image-loader',
    );

    config.module.rules[imageLoader] = {
      oneOf: [
        {
          issuer: /\.[jt]sx?$/,
          resourceQuery: /svgr/,
          test: /\.svg$/i,
          use: [
            {
              loader: '@svgr/webpack',
            },
          ],
        },
        config.module.rules[imageLoader],
      ],
    };

    return config;
  },
};

export default config;
