const { execSync } = require("child_process");
const path = require("path");
const dotenv = require("dotenv");


// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

// Ensure migrations are run for the test database
beforeAll(() => {
  execSync("npx prisma migrate reset --force --skip-seed");
});

// Clean up the database after tests
afterAll(() => {
  // Optionally clean up data in the test DB here
});
