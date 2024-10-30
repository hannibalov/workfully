const dotenv = require("dotenv");

module.exports = {
  preset: "ts-jest",
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  projects: [
    {
      displayName: "server", // For backend/API tests
      testEnvironment: "node",
      testMatch: ["**/*.test.ts"], // Match only server-side test files
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/app/$1"
      },
      setupFilesAfterEnv: [], // No jsdom or client-specific setups
      globals: {
        "process.env": {
          ...process.env,
          ...dotenv.config({ path: ".env.test" }).parsed,
        },
      },
    },
  ],
};
