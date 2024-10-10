import { canChangeToStatus, Task } from "../../shared/constants";
import { taskDao } from "../daos/taskDao";
import { Prisma } from "@prisma/client";

export async function getAll(tx: Prisma.TransactionClient) {
  return await taskDao.getAll(tx);
}

export async function create(
  tx: Prisma.TransactionClient,
  { title, description }: Pick<Task, "title" | "description">
) {
  if (!title || !description) {
    throw new Error("Title and description are required");
  }

  const newTask = await taskDao.create(tx, {
    title,
    description,
  });

  return newTask;
}

export async function updateStatus(
  tx: Prisma.TransactionClient,
  { id, status }: Pick<Task, "id" | "status">
) {
  const task = await taskDao.get(tx, id);

  if (!task) {
    return null;
  }

  if (task.status === "DONE") {
    throw new Error("Cannot change status of a DONE task");
  }

  if (!canChangeToStatus(task, status)) {
    throw new Error(`Cannot change status to ${status} from ${task.status}`);
  }

  // Logic for "DOING" task status
  if (status === "DOING") {
    const doingTasks = await taskDao.countByStatus(tx, status);

    if (doingTasks >= 2) {
      throw new Error("Cannot have more than 2 tasks with status DOING");
    }
  }

  const updatedTask = await taskDao.update(tx, id, {
    status,
  });

  return updatedTask;
}

export const taskFacade = {
  create,
  getAll,
  updateStatus,
};
