const Sequencer = require('@jest/test-sequencer').default;
const path = require('path');

class AlphaNumericSequencer extends Sequencer {
  sort(tests) {
    // Test structure information
    // https://github.com/facebook/jest/blob/6b8b1404a1d9254e7d5d90a8934087a9c9899dab/packages/jest-runner/src/types.ts#L17-L21
    return Array.from(tests).sort((testA, testB) => (
      path.basename(testA.path, '.ts').localeCompare(path.basename(testB.path, '.ts'), undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    ))
  }
}

module.exports = AlphaNumericSequencer;
