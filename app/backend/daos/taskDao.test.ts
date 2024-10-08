import { Prisma } from "@prisma/client";
import { taskDao } from "./taskDao";
import { Task } from "../../shared/constants";
import prisma from "../../../lib/prisma";

describe("taskDao", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("create", () => {
    it("should create a new task", async () => {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const taskData: Pick<Task, "title" | "description"> = {
          title: "Test Task",
          description: "Test Description",
        };
        const newTask = await taskDao.create(tx, taskData);
        expect(newTask).toHaveProperty("id");
        expect(newTask.title).toBe(taskData.title);
        expect(newTask.description).toBe(taskData.description);
        expect(newTask.status).toBe("BACKLOG");
      });
    });
  });

  describe("get", () => {
    it("should get a task by id", async () => {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const task = await taskDao.create(tx, {
          title: "Test Task",
          description: "Test Description",
        });
        const fetchedTask = await taskDao.get(tx, task.id);
        expect(fetchedTask).toEqual(task);
      });
    });
  });

  describe("getAll", () => {
    it("should get all tasks", async () => {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Delete all current tasks
        await prisma.task.deleteMany();

        // Add a few tasks
        const taskData1: Pick<Task, "title" | "description"> = {
          title: "Task 1",
          description: "Description 1",
        };
        const taskData2: Pick<Task, "title" | "description"> = {
          title: "Task 2",
          description: "Description 2",
        };
        const task1 = await taskDao.create(tx, taskData1);
        const task2 = await taskDao.create(tx, taskData2);

        // Retrieve all tasks
        const tasks = await taskDao.getAll(tx);

        // Compare if the tasks retrieved are the same as the ones saved
        expect(tasks).toHaveLength(2);
        expect(tasks).toEqual(
          expect.arrayContaining([
            expect.objectContaining(task1),
            expect.objectContaining(task2),
          ])
        );
      });
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const task = await taskDao.create(tx, {
          title: "Test Task",
          description: "Test Description",
        });
        const updatedData: Partial<
          Pick<Task, "title" | "description" | "status">
        > = {
          title: "Updated Task",
          description: "Updated Description",
          status: "TODO",
        };
        const updatedTask = await taskDao.update(tx, task.id, updatedData);
        expect(updatedTask.title).toBe(updatedData.title);
        expect(updatedTask.description).toBe(updatedData.description);
        expect(updatedTask.status).toBe(updatedData.status);
      });
    });
  });

  describe("remove", () => {
    it("should delete a task", async () => {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const task = await taskDao.create(tx, {
          title: "Test Task",
          description: "Test Description",
        });
        const deletedTask = await taskDao.remove(tx, task.id);
        expect(deletedTask).toEqual(task);

        const fetchedTask = await taskDao.get(tx, task.id);
        expect(fetchedTask).toBeNull();
      });
    });
  });

  describe("countByStatus", () => {
    it("should count tasks by status", async () => {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Delete all current tasks
        await tx.task.deleteMany();

        const addTask = async (index: number) => {
          const taskData: Pick<Task, "title" | "description"> = {
            title: `Task ${index}`,
            description: `Task ${index}`,
          };
          const addedTask = await taskDao.create(tx, taskData);
          await taskDao.update(tx, addedTask.id, {
            status: index < 1 ? "BACKLOG" : index < 3 ? "DOING" : "DONE",
          });
        };

        // Add a few tasks
        for (let i = 0; i < 6; i++) await addTask(i);

        // Count tasks by status
        const backlogCount = await taskDao.countByStatus(tx, "BACKLOG");
        const inProgressCount = await taskDao.countByStatus(tx, "DOING");
        const doneCount = await taskDao.countByStatus(tx, "DONE");

        // Check that the counts match what we added
        expect(backlogCount).toBe(1);
        expect(inProgressCount).toBe(2);
        expect(doneCount).toBe(3);
      });
    });
  });
});
