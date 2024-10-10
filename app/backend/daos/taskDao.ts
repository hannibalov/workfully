import { Prisma, Task } from "@prisma/client";
import { TaskStatus } from "../../shared/constants";

const create = async (
  tx: Prisma.TransactionClient,
  { title, description }: Pick<Task, "description" | "title">
) => {
  const newTask = await tx.task.create({
    data: {
      title,
      description,
      status: "BACKLOG",
    },
  });

  return newTask;
};

const get = async (tx: Prisma.TransactionClient, id: number) => {
  const task = await tx.task.findUnique({
    where: { id },
  });
  return task;
};

const getAll = async (tx: Prisma.TransactionClient) => {
  const tasks = await tx.task.findMany();
  return tasks;
};

const update = async (
  tx: Prisma.TransactionClient,
  id: number,
  data: Partial<Pick<Task, "title" | "description" | "status">>
) => {
  const updatedTask = await tx.task.update({
    where: { id },
    data,
  });
  return updatedTask;
};

const remove = async (tx: Prisma.TransactionClient, id: number) => {
  const deletedTask = await tx.task.delete({
    where: { id },
  });
  return deletedTask;
};

const countByStatus = async (
  tx: Prisma.TransactionClient,
  status: TaskStatus
) => {
  const count = await tx.task.count({
    where: { status },
  });
  return count;
};

export const taskDao = {
  create,
  get,
  getAll,
  update,
  remove,
  countByStatus,
};
