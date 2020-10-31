module.exports = (api) => (
  api.env('test') ? {
    plugins: [
      ['styled-components'],
    ],
    presets: [
      ['@babel/env', { targets: { node: 'current' } }],
      ['@babel/react'],
      ['@babel/typescript'],
    ],
  } : {
    plugins: [
      ['styled-components'],
    ],
    presets: [
      ['@babel/env', { modules: false }],
      ['@babel/react'],
      ['@babel/typescript'],
    ],
  }
);
