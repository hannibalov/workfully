import Koa from "koa";
import bodyParser from "koa-body";
import Router from "koa-router";
import request from "supertest";
import { taskController } from "./taskController";
import { withTransaction } from "../middleware/middleware";
import prisma from "../../../lib/prisma";

// Mocking Prisma client with $transaction
jest.mock("../../../lib/prisma", () => {
  return {
    $transaction: jest.fn().mockImplementation((fn) =>
      fn({
        task: {
          create: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(), // Add findMany for GET tests
        },
      })
    ),
  };
});

// Initialize Koa app and router
const app = new Koa();
app.use(bodyParser());
const router = new Router();

// Wrap controller methods with the withTransaction middleware
router.get("/tasks", withTransaction, taskController.getAll);
router.post("/tasks", withTransaction, taskController.addTask);
router.patch("/tasks", withTransaction, taskController.updateTaskStatus);
app.use(router.routes()).use(router.allowedMethods());

describe("GET /tasks", () => {
  it("should return an array of tasks", async () => {
    const mockTasks = [
      { id: 1, title: "Task 1", description: "Description 1", status: "TODO" },
      { id: 2, title: "Task 2", description: "Description 2", status: "DOING" },
    ];

    const transactionalPrisma = {
      task: {
        findMany: jest.fn().mockResolvedValue(mockTasks),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
      fn(transactionalPrisma)
    );

    const res = await request(app.callback()).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockTasks);
  });
});

describe("PATCH /tasks", () => {
  it("should return 404 if task is not found", async () => {
    const transactionalPrisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
      fn(transactionalPrisma)
    );

    const res = await request(app.callback())
      .patch("/tasks")
      .send({ id: 999, status: "TODO" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Task not found");
  });

  it("should return 400 if status is invalid", async () => {
    const transactionalPrisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue({
          id: 888,
          status: "TODO",
        }),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
      fn(transactionalPrisma)
    );

    const res = await request(app.callback())
      .patch("/tasks")
      .send({ id: 888, status: "INVALID_STATUS" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/"status" must be one of/); // Adjust based on your Joi message
  });

  it("should return 400 if the task status is DONE", async () => {
    const transactionalPrisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue({
          id: 888,
          status: "DONE",
        }),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
      fn(transactionalPrisma)
    );

    const res = await request(app.callback())
      .patch("/tasks")
      .send({ id: 888, status: "TODO" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Cannot change status of a DONE task");
  });

  it("should fail if there are already 2 tasks in DIONG", async () => {
    const transactionalPrisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue({
          id: 666,
          status: "TODO",
        }),
        count: jest.fn().mockResolvedValue(2),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
      fn(transactionalPrisma)
    );

    const res = await request(app.callback())
      .patch("/tasks")
      .send({ id: 666, status: "DOING" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      "Cannot have more than 2 tasks with status DOING"
    );
  });

  it("should update the task status successfully", async () => {
    const transactionalPrisma = {
      task: {
        findUnique: jest.fn().mockResolvedValue({
          id: 777,
          status: "TODO",
        }),
        update: jest.fn().mockResolvedValue({
          id: 777,
          status: "DOING",
        }),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
      fn(transactionalPrisma)
    );

    const res = await request(app.callback())
      .patch("/tasks")
      .send({ id: 777, status: "DOING" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("DOING");
  });
});

describe("POST /tasks", () => {
  it("should return 400 if title or description is missing", async () => {
    const resTitle = await request(app.callback())
      .post("/tasks")
      .send({ title: "New Task" });
    expect(resTitle.status).toBe(400);
    expect(resTitle.body.error).toBe('"description" is required');

    const resDescription = await request(app.callback())
      .post("/tasks")
      .send({ description: "New Task" });
    expect(resDescription.status).toBe(400);
    expect(resDescription.body.error).toBe('"title" is required');
  });

  it("should add a new task successfully", async () => {
    const transactionalPrisma = {
      task: {
        create: jest.fn().mockResolvedValue({
          id: 1,
          title: "New Task",
          description: "New Description",
          status: "TODO",
        }),
      },
    };
    (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
      fn(transactionalPrisma)
    );

    const res = await request(app.callback()).post("/tasks").send({
      title: "New Task",
      description: "New Description",
    });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New Task");
    expect(res.body.description).toBe("New Description");
    expect(res.body.status).toBe("TODO");
  });
});
