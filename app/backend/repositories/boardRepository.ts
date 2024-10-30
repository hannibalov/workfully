import { Prisma, Board, Project } from "@prisma/client";
import { v4 as uuid } from "uuid";

const create = async (
  context: Prisma.TransactionClient,
  data: { title: string; projectId: Project["id"] }
): Promise<Board> => {
  return context.board.create({ data: { ...data, id: uuid() } });
};

const get = async (
  context: Prisma.TransactionClient,
  id: Board["id"]
): Promise<Board | null> => {
  return context.board.findUnique({ where: { id } });
};

const update = async (
  context: Prisma.TransactionClient,
  id: Board["id"],
  data: Partial<Board>
): Promise<Board | null> => {
  return context.board.update({ where: { id }, data });
};

const remove = async (
  context: Prisma.TransactionClient,
  id: Board["id"]
): Promise<Board> => {
  return context.board.delete({ where: { id } });
};

export const boardRepository = {
  create,
  get,
  update,
  remove,
};
