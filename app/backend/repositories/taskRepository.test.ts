import { Board, Column, Project } from "@prisma/client";
import prisma from "../../../lib/prisma";
import { taskRepository } from "./taskRepository";
import { v4 as uuid } from "uuid";

describe("taskRepository", () => {
  const mockContext = prisma;
  let project: Project, board: Board, column: Column;

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
    const columnData = { id: uuid(), title: "Test Column", boardId: board.id };
    column = await prisma.column.create({ data: columnData });
  });

  afterEach(async () => {
    await prisma.project.delete({ where: { id: project.id } });
  });

  describe("create", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task",
        description: "Description",
        columnId: column.id,
      };

      const createdTask = await taskRepository.create(mockContext, taskData);

      expect(createdTask).toMatchObject(taskData);
      expect(createdTask.id).toBeDefined();
    });
  });

  describe("get", () => {
    it("should retrieve a task by id", async () => {
      const taskData = {
        title: "Test Task",
        description: "Description",
        columnId: column.id,
      };
      const createdTask = await taskRepository.create(mockContext, taskData);

      const result = await taskRepository.get(mockContext, createdTask.id);

      expect(result).toEqual(createdTask); // Verify the retrieved task matches the created task
    });

    it("should return null if task is not found", async () => {
      const result = await taskRepository.get(mockContext, "999"); // Non-existent ID

      expect(result).toBeNull(); // Verify that null is returned
    });
  });

  describe("update", () => {
    it("should update an existing task", async () => {
      const taskData = {
        title: "Original Task",
        description: "Description",
        columnId: column.id,
      };
      const createdTask = await taskRepository.create(mockContext, taskData);

      const updateData = { title: "Updated Task" };
      const updatedTask = await taskRepository.update(
        mockContext,
        createdTask.id,
        updateData
      );

      expect(updatedTask?.title).toEqual(updateData.title); // Check that the title was updated
    });
  });

  describe("remove", () => {
    it("should delete an existing task", async () => {
      const taskData = {
        title: "Task to be deleted",
        description: "Description",
        columnId: column.id,
      };
      const createdTask = await taskRepository.create(mockContext, taskData);

      const deletedTask = await taskRepository.remove(
        mockContext,
        createdTask.id
      );

      expect(deletedTask.id).toEqual(createdTask.id); // Ensure the deleted task matches the created task
      const result = await taskRepository.get(mockContext, createdTask.id);
      expect(result).toBeNull(); // Verify the task is deleted
    });
  });
});
