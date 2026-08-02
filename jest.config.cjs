module.exports = {
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/tests/**",
    "!**/node_modules/**",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
};
