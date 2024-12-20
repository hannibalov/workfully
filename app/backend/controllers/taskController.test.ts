import Koa from "koa";
import bodyParser from "koa-body";
import Router from "koa-router";
import request from "supertest";
import { taskController } from "./taskController";
import { withTransaction } from "../middleware/middleware";
import prisma from "../../../lib/prisma";

// Mocking Prisma client with $transaction
jest.mock("../../../lib/prisma", () => ({
  $transaction: jest.fn(),
}));

// Initialize Koa app and router
const app = new Koa();
app.use(bodyParser());
const router = new Router();

// Wrap controller methods with the withTransaction middleware
router.get("/api/task/:id", withTransaction, taskController.get);
router.post("/api/task", withTransaction, taskController.create);
router.patch("/api/task/:id", withTransaction, taskController.update);
router.delete("/api/task/:id", withTransaction, taskController.remove);

app.use(router.routes()).use(router.allowedMethods());

describe("Task Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /task/:id", () => {
    it("should return the task", async () => {
      const mockTasks = {
        id: 1,
        title: "Task 1",
        description: "Description 1",
      };

      // Set up mock for $transaction
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          task: {
            findUnique: jest.fn().mockResolvedValue(mockTasks),
          },
        })
      );

      const res = await request(app.callback()).get("/api/task/123");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTasks);
    });
  });

  describe("PATCH /task", () => {
    it("should return 404 if task is not found", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          task: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        })
      );

      const res = await request(app.callback())
        .patch("/api/task/999")
        .send({ description: "TODO" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Task not found");
    });

    it("should update the task successfully", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          task: {
            findUnique: jest.fn().mockResolvedValue({
              id: 777,
              title: "Title",
              columnId: 123,
            }),
            update: jest.fn().mockResolvedValue({
              id: 777,
              title: "Changed",
              columnId: 123,
            }),
          },
        })
      );

      const res = await request(app.callback())
        .patch("/api/task/777")
        .send({ title: "Changed" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Changed");
    });
  });

  describe("POST /task", () => {
    it("should return 400 if title or columnId is missing", async () => {
      const resTitle = await request(app.callback())
        .post("/api/task")
        .send({ title: "New Task" });
      expect(resTitle.status).toBe(400);
      expect(resTitle.body.error).toBe('"columnId" is required');

      const resDescription = await request(app.callback())
        .post("/api/task")
        .send({ columnId: 123 });
      expect(resDescription.status).toBe(400);
      expect(resDescription.body.error).toBe('"title" is required');
    });

    it("should add a new task successfully", async () => {
      const newTask = {
        id: 1,
        title: "New Task",
        description: "New Description",
        columnId: 123,
      };

      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          task: {
            create: jest.fn().mockResolvedValue(newTask),
          },
        })
      );

      const res = await request(app.callback()).post("/api/task").send({
        title: "New Task",
        description: "New Description",
        columnId: 123,
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(newTask);
    });
  });
});
