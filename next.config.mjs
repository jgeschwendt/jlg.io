/** @type {import('next').NextConfig} */
const config = {
  compiler: {
    emotion: true,
  },
  experimental: {
    runtime: 'experimental-edge',
  },
  webpack(config, context) {
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

    // https://github.com/vercel/next.js/issues/39229
    if (context.nextRuntime === 'edge') {
      if (!config.resolve.conditionNames) {
        config.resolve.conditionNames = ['require', 'worker'];
      }
    }

    return config;
  },
};

export default config;
