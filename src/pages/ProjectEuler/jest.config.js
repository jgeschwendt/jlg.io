module.exports = {
  "reporters": [
    "default",
    ["jest-html-reporter", {
      "outputPath": "dist/test-report.html",
      "pageTitle": "Test Report",
      "sort": "titleAsc",
    }],
  ],
  "testMatch": [
    "<rootDir>/problems/*.ts",
  ],
};
