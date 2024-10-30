import { v4 as uuid } from "uuid";
import prisma from "../../../lib/prisma";
import { Board } from "@prisma/client";

describe("Cascade Deletion Tests", () => {
  let boardId: Board["id"];

  beforeEach(async () => {
    const project = await prisma.project.create({
      data: {
        id: uuid(),
        title: "Test Project",
        description: "Test Description",
      },
    });
    const board = await prisma.board.create({
      data: {
        id: uuid(),
        title: "Test Board",
        projectId: project.id,
        columns: {
          create: [
            { id: uuid(), title: "Column 1" },
            { id: uuid(), title: "Column 2" },
          ],
        },
      },
      include: { columns: true },
    });
    boardId = board.id;
  });

  afterEach(async () => {
    await prisma.task.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
  });

  it("should delete associated columns when a board is deleted", async () => {
    await prisma.board.delete({
      where: { id: boardId },
    });

    const columns = await prisma.column.findMany({
      where: { boardId },
    });
    expect(columns.length).toBe(0);
  });

  // Additional tests for deeper cascades can go here if needed
});
