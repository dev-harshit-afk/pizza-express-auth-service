module.exports = {
  testEnvironment: "node",
  verbose: true,
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
