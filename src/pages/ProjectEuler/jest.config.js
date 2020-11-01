module.exports = {
  reporters: ['default', ['jest-html-reporter', {
    outputPath: 'dist/test-report.html',
    pageTitle: 'Test Report',
    sort: 'titleAsc',
  }]],
  testRegex: [
    /\d+-\d+\/\d+.ts/,
  ],
  testSequencer: './jest.sequencer.js',
};
