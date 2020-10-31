module.exports = {
  "reporters": [
    "default",
    ["jest-html-reporter", {
      "outputPath": "dist/test-report.html",
      "pageTitle": "Test Report",
    }],
  ],
  "testMatch": [
    "<rootDir>/problems/*.ts",
  ],
};
