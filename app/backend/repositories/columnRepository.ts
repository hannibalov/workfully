import { Prisma, Column, Board } from "@prisma/client";
import { v4 as uuid } from "uuid";

const create = async (
  context: Prisma.TransactionClient,
  data: { title: string; boardId: Board["id"] }
): Promise<Column> => {
  return context.column.create({ data: { ...data, id: uuid() } });
};

const get = async (
  context: Prisma.TransactionClient,
  id: Column["id"]
): Promise<Column | null> => {
  return context.column.findUnique({ where: { id } });
};

const getAllInBoard = async (
  context: Prisma.TransactionClient,
  boardId: Board["id"]
): Promise<Column[]> => {
  return context.column.findMany({ where: { board: { id: boardId } } });
};

const update = async (
  context: Prisma.TransactionClient,
  id: Column["id"],
  data: Partial<Column>
): Promise<Column | null> => {
  return context.column.update({ where: { id }, data });
};

const remove = async (
  context: Prisma.TransactionClient,
  id: Column["id"]
): Promise<Column> => {
  return context.column.delete({ where: { id } });
};

export const columnRepository = {
  create,
  get,
  getAllInBoard,
  update,
  remove,
};
