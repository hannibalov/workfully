import { Project } from "@prisma/client";
import prisma from "../../../lib/prisma";
import { boardRepository } from "./boardRepository";
import { v4 as uuid } from "uuid";

describe("boardRepository", () => {
  const mockContext = prisma;
  let project: Project;

  beforeEach(async () => {
    const projectData = {
      id: uuid(),
      title: "Test Project",
      description: "Test Description",
    };
    project = await prisma.project.create({ data: projectData });
  });

  afterEach(async () => {
    await prisma.project.delete({ where: { id: project.id } });
  });

  describe("create", () => {
    it("should create a new board", async () => {
      const boardData = {
        title: "Test Board",
        projectId: project.id,
      };

      const createdBoard = await boardRepository.create(mockContext, boardData);

      expect(createdBoard).toMatchObject(boardData);
      expect(createdBoard.id).toBeDefined();
    });
  });

  describe("get", () => {
    it("should retrieve a board by id", async () => {
      const boardData = {
        title: "Test Board",
        projectId: project.id,
      };
      const createdBoard = await boardRepository.create(mockContext, boardData);

      const result = await boardRepository.get(mockContext, createdBoard.id);

      expect(result).toEqual(createdBoard); // Verify the retrieved board matches the created board
    });

    it("should return null if board is not found", async () => {
      const result = await boardRepository.get(mockContext, "999"); // Non-existent ID

      expect(result).toBeNull(); // Verify that null is returned
    });
  });

  describe("update", () => {
    it("should update an existing board", async () => {
      const boardData = {
        id: uuid(),
        title: "Original Board",
        projectId: project.id,
      };
      const createdBoard = await boardRepository.create(mockContext, boardData);

      const updateData = { title: "Updated Board" };
      const updatedBoard = await boardRepository.update(
        mockContext,
        createdBoard.id,
        updateData
      );

      expect(updatedBoard?.title).toEqual(updateData.title); // Check that the title was updated
    });
  });

  describe("remove", () => {
    it("should delete an existing board", async () => {
      const boardData = {
        id: uuid(),
        title: "Board to be deleted",
        projectId: project.id,
      };
      const createdBoard = await boardRepository.create(mockContext, boardData);

      const deletedBoard = await boardRepository.remove(
        mockContext,
        createdBoard.id
      );

      expect(deletedBoard.id).toEqual(createdBoard.id); // Ensure the deleted board matches the created board
      const result = await boardRepository.get(mockContext, createdBoard.id);
      expect(result).toBeNull(); // Verify the board is deleted
    });
  });
});
