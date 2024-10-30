import Koa from "koa";
import bodyParser from "koa-body";
import Router from "koa-router";
import request from "supertest";
import { boardController } from "./boardController";
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
router.get("/api/board/:id", withTransaction, boardController.get);
router.post("/api/board", withTransaction, boardController.create);
router.patch("/api/board/:id", withTransaction, boardController.update);
router.delete("/api/board/:id", withTransaction, boardController.remove);

app.use(router.routes()).use(router.allowedMethods());

describe("Board Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /board/:boardId", () => {
    it("should return an array of columns", async () => {
      const mockColumns = [
        { id: 1, title: "Column 1" },
        { id: 2, title: "Column 2" },
      ];

      const mockBoard = { id: 123, title: "Board 1" };

      // Set up mock for $transaction
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          board: {
            findUnique: jest.fn().mockResolvedValue(mockBoard),
          },
          column: {
            findMany: jest.fn().mockResolvedValue(mockColumns),
          },
        })
      );

      const res = await request(app.callback()).get("/api/board/123");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: 123,
        title: "Board 1",
        columns: mockColumns,
      });
    });

    it("should return 404 if board does not exist", async () => {
      // Set up mock for $transaction
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          board: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        })
      );

      const res = await request(app.callback()).get("/api/board/123");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /board", () => {
    it("should create a new board", async () => {
      const mockBoard = { id: 1, title: "Board 1" };

      // Set up mock for $transaction
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          board: {
            create: jest.fn().mockResolvedValue(mockBoard),
          },
        })
      );

      const res = await request(app.callback())
        .post("/api/board")
        .send({ title: "Board 1", projectId: 1 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockBoard);
    });
  });

  describe("PATCH /board/:boardId", () => {
    it("should update a board", async () => {
      const mockBoard = { id: 1, title: "Board 1" };

      // Set up mock for $transaction
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          board: {
            findUnique: jest.fn().mockResolvedValue(mockBoard),
            update: jest.fn().mockResolvedValue(mockBoard),
          },
        })
      );

      const res = await request(app.callback())
        .patch("/api/board/1")
        .send({ id: 1, title: "Board 1" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockBoard);
    });

    it("should return 404 if board does not exist", async () => {
      // Set up mock for $transaction
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          board: {
            findUnique: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockResolvedValue(null),
          },
        })
      );

      const res = await request(app.callback())
        .patch("/api/board/1")
        .send({ id: 1, title: "Board 1" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /board/:boardId", () => {
    it("should delete a board", async () => {
      const mockBoard = { id: 1, title: "Board 1" };

      // Set up mock for $transaction
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          board: {
            findUnique: jest.fn().mockResolvedValue(mockBoard),
            delete: jest.fn().mockResolvedValue(mockBoard),
          },
        })
      );

      const res = await request(app.callback())
        .delete("/api/board/1")
        .send({ id: 1 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockBoard);
    });

    it("should return 404 if board does not exist", async () => {
      // Set up mock for $transaction
      (prisma.$transaction as jest.Mock).mockImplementation((fn) =>
        fn({
          board: {
            findUnique: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(null),
          },
        })
      );

      const res = await request(app.callback())
        .delete("/api/board/1")
        .send({ id: 1 });

      expect(res.status).toBe(404);
    });
  });
});
