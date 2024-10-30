import { Board, Project } from "@prisma/client";
import prisma from "../../../lib/prisma";
import { columnRepository } from "./columnRepository";
import { v4 as uuid } from "uuid";

describe("columnRepository", () => {
  const mockContext = prisma;
  let project: Project, board: Board;

  beforeEach(async () => {
    const projectData = {
      id: uuid(),
      title: "Test Project",
      description: "Test Description",
    };
    project = await prisma.project.create({ data: projectData });
    const boardData = {
      id: uuid(),
      title: "Test Board",
      projectId: project.id,
    };
    board = await prisma.board.create({ data: boardData });
  });

  afterEach(async () => {
    await prisma.project.delete({ where: { id: project.id } });
  });

  describe("create", () => {
    it("should create a new column", async () => {
      const columnData = {
        title: "Test Column",
        boardId: board.id,
      };

      const createdColumn = await columnRepository.create(
        mockContext,
        columnData
      );

      expect(createdColumn).toMatchObject(columnData);
      expect(createdColumn.id).toBeDefined();
    });
  });

  describe("get", () => {
    it("should retrieve a column by id", async () => {
      const columnData = {
        title: "Test Column",
        boardId: board.id,
      };
      const createdColumn = await columnRepository.create(
        mockContext,
        columnData
      );

      const result = await columnRepository.get(mockContext, createdColumn.id);

      expect(result).toEqual(createdColumn); // Verify the retrieved column matches the created column
    });

    it("should return null if column is not found", async () => {
      const result = await columnRepository.get(mockContext, "999"); // Non-existent ID

      expect(result).toBeNull(); // Verify that null is returned
    });
  });

  describe("getAllInBoard", () => {
    it("should retrieve all columns in a board", async () => {
      const columnData1 = {
        title: "Test Column 1",
        boardId: board.id,
      };
      const columnData2 = {
        title: "Test Column 2",
        boardId: board.id,
      };
      const createdColumns = [];
      createdColumns.push(
        await columnRepository.create(mockContext, columnData1)
      );
      createdColumns.push(
        await columnRepository.create(mockContext, columnData2)
      );

      const columns = await columnRepository.getAllInBoard(
        mockContext,
        board.id
      );

      expect(columns).toEqual(createdColumns); // Verify the retrieved columns match the created column
    });

    it("should return an empty array if no columns are found", async () => {
      const columns = await columnRepository.getAllInBoard(mockContext, "999"); // Non-existent ID

      expect(columns).toEqual([]); // Verify that an empty array is returned
    });
  });

  describe("update", () => {
    it("should update an existing column", async () => {
      const columnData = {
        title: "Original Column",
        boardId: board.id,
      };
      const createdColumn = await columnRepository.create(
        mockContext,
        columnData
      );

      const updateData = { title: "Updated Column" };
      const updatedColumn = await columnRepository.update(
        mockContext,
        createdColumn.id,
        updateData
      );

      expect(updatedColumn?.title).toEqual(updateData.title); // Check that the title was updated
    });
  });

  describe("remove", () => {
    it("should delete an existing column", async () => {
      const columnData = {
        title: "Column to be deleted",
        boardId: board.id,
      };
      const createdColumn = await columnRepository.create(
        mockContext,
        columnData
      );

      const deletedColumn = await columnRepository.remove(
        mockContext,
        createdColumn.id
      );

      expect(deletedColumn.id).toEqual(createdColumn.id); // Ensure the deleted column matches the created column
      const result = await columnRepository.get(mockContext, createdColumn.id);
      expect(result).toBeNull(); // Verify the column is deleted
    });
  });
});
