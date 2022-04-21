module.exports = {
  experimental: {
    emotion: true,
    runtime: 'edge',
  },
  swcMinify: true,
  webpack(config) {
    const imageLoader = config.module.rules.findIndex(
      ({ loader }) => loader === 'next-image-loader'
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
