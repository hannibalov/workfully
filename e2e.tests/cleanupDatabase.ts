import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanupDatabase() {
  try {
    // Delete all records from your tables here
    await prisma.task.deleteMany(); // Adjust this line based on your schema
    console.log("Database cleaned successfully");
  } catch (error) {
    console.error("Error cleaning database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Call cleanup function when the script is run
cleanupDatabase();
