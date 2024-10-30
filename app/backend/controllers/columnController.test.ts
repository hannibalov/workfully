import Koa from "koa";
import bodyParser from "koa-body";
import Router from "koa-router";
import request from "supertest";
import { columnController } from "./columnController";
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
router.get("/api/column/:id", withTransaction, columnController.get);
router.post("/api/column", withTransaction, columnController.create);
router.patch("/api/column/:id", withTransaction, columnController.update);
router.delete("/api/column/:id", withTransaction, columnController.remove);

app.use(router.routes()).use(router.allowedMethods());

describe("Column Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /column/:id", () => {
    it("should return the column with the associated tasks", async () => {
      const mockColumn = {
        id: 1,
        title: "Column 1",
        tasks: [
          { id: 1, title: "Task 1", description: "Description 1" },
          { id: 2, title: "Task 2", description: "Description 2" },
        ],
      };

      // Set up mock for $transaction
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          task: {
            findMany: jest.fn().mockResolvedValue(mockColumn.tasks),
          },
          column: {
            findUnique: jest.fn().mockResolvedValue(mockColumn),
          },
        })
      );

      const res = await request(app.callback()).get("/api/column/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockColumn);
    });

    it("should return 404 if column is not found", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          column: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        })
      );

      const res = await request(app.callback()).get("/api/column/999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Column not found");
    });
  });

  describe("PATCH /column", () => {
    it("should return 404 if column is not found", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          column: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        })
      );

      const res = await request(app.callback())
        .patch("/api/column/999")
        .send({ description: "TODO" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Column not found");
    });

    it("should update the column successfully", async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          column: {
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
        .patch("/api/column/777")
        .send({ title: "Changed" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Changed");
    });
  });

  describe("POST /column", () => {
    it("should return 400 if title or columnId is missing", async () => {
      const resTitle = await request(app.callback())
        .post("/api/column")
        .send({ title: "New Column" });
      expect(resTitle.status).toBe(400);
      expect(resTitle.body.error).toBe('"boardId" is required');

      const resDescription = await request(app.callback())
        .post("/api/column")
        .send({ columnId: 123 });
      expect(resDescription.status).toBe(400);
      expect(resDescription.body.error).toBe('"title" is required');
    });

    it("should add a new column successfully", async () => {
      const newColumn = {
        id: 1,
        title: "New Column",
        boardId: 123,
      };

      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          column: {
            create: jest.fn().mockResolvedValue(newColumn),
          },
        })
      );

      const res = await request(app.callback()).post("/api/column").send({
        title: "New Column",
        boardId: 123,
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(newColumn);
    });
  });
});
