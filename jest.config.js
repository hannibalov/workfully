module.exports = {
  preset: "ts-jest",
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  projects: [
    {
      displayName: "server", // For backend/API tests
      testEnvironment: "node",
      setupFilesAfterEnv: [], // No jsdom or client-specific setups
      testMatch: ["**/*.test.ts"], // Match only server-side test files
      globals: {
        "process.env.DATABASE_URL": require("dotenv").config({ path: ".env.test" }).parsed.DATABASE_URL,
      },
    },
  ],
};
