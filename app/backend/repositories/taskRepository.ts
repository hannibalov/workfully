import { Column, Prisma, Task } from "@prisma/client";
import { v4 as uuid } from "uuid";

const create = async (
  context: Prisma.TransactionClient,
  data: { title: string; description: string; columnId: Column["id"] }
): Promise<Task> => {
  return context.task.create({ data: { ...data, id: uuid() } });
};

const get = async (
  context: Prisma.TransactionClient,
  id: Task["id"]
): Promise<Task | null> => {
  return context.task.findUnique({ where: { id } });
};

const getAllInColumn = async (
  context: Prisma.TransactionClient,
  columnId: Column["id"]
): Promise<Task[]> => {
  return context.task.findMany({ where: { column: { id: columnId } } });
};

const update = async (
  context: Prisma.TransactionClient,
  id: Task["id"],
  data: Partial<Task>
): Promise<Task | null> => {
  return context.task.update({ where: { id }, data });
};

const remove = async (
  context: Prisma.TransactionClient,
  id: Task["id"]
): Promise<Task> => {
  return context.task.delete({ where: { id } });
};

export const taskRepository = {
  create,
  get,
  getAllInColumn,
  update,
  remove,
};
