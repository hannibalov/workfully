import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
  },
  testDir: "./e2e.tests",
});
