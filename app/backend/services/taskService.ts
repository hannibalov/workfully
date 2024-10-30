import { Column, Prisma, Task } from "@prisma/client";
import { taskRepository } from "../repositories/taskRepository";
import {
  BasicError,
  errorMessages,
  ResourceNotFoundError,
} from "@/shared/utils/errors";

const create = async (
  context: Prisma.TransactionClient,
  data: { title: string; description: string; columnId: Column["id"] }
): Promise<Task> => {
  if (!data.title) {
    throw new BasicError(errorMessages.PARAMETER_MISSING("Task title"));
  }

  // Add any other business logic validations or transformations here
  return taskRepository.create(context, data);
};

const get = async (
  context: Prisma.TransactionClient,
  id: Task["id"]
): Promise<Task | null> => {
  const task = await taskRepository.get(context, id);
  if (!task) {
    throw new ResourceNotFoundError("Task");
  }
  return task;
};

const update = async (
  context: Prisma.TransactionClient,
  id: Task["id"],
  data: Partial<Task>
): Promise<Task | null> => {
  const existingTask = await taskRepository.get(context, id);
  if (!existingTask) {
    throw new ResourceNotFoundError("Task");
  }

  // Apply any additional validations for updates, if necessary
  return taskRepository.update(context, id, data);
};

const remove = async (
  context: Prisma.TransactionClient,
  id: Task["id"]
): Promise<void> => {
  const existingTask = await taskRepository.get(context, id);
  if (!existingTask) {
    throw new ResourceNotFoundError("Task");
  }

  await taskRepository.remove(context, id);
};

// Export the service as an object
export const taskService = {
  create,
  get,
  update,
  remove,
};
