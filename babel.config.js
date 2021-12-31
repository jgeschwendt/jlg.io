'use strict';

module.exports = (api) => (
  api.env('test') ? {
    // plugins: ['@emotion/babel-plugin'],
    presets: [
      [
        'next/babel',
        // {
        //   'preset-react': {
        //     importSource: '@emotion/react',
        //     runtime: 'automatic',
        //   },
        // },
      ],
    ],
  } : {
    plugins: ['@emotion/babel-plugin'],
    presets: [
      [
        'next/babel',
        {
          'preset-react': {
            importSource: '@emotion/react',
            runtime: 'automatic',
          },
        },
      ],
    ],
  }
);
