import { Prisma, Column, Task, Board } from "@prisma/client";
import { columnRepository } from "../repositories/columnRepository";
import {
  BasicError,
  errorMessages,
  ResourceNotFoundError,
} from "@/shared/utils/errors";
import { taskRepository } from "../repositories/taskRepository";

const create = async (
  context: Prisma.TransactionClient,
  data: { title: string; boardId: Board["id"] }
): Promise<Column> => {
  if (!data.title) {
    throw new BasicError(errorMessages.PARAMETER_MISSING("Column title"));
  }

  // Add any other business logic validations or transformations here
  return columnRepository.create(context, data);
};

const get = async (
  context: Prisma.TransactionClient,
  id: Column["id"]
): Promise<(Column & { tasks: Task[] }) | null> => {
  const column = await columnRepository.get(context, id);
  if (!column) {
    throw new ResourceNotFoundError("Column");
  }
  const tasks = await taskRepository.getAllInColumn(context, id);
  return { ...column, tasks };
};

const update = async (
  context: Prisma.TransactionClient,
  id: Column["id"],
  data: Partial<Column>
): Promise<Column | null> => {
  const existingColumn = await columnRepository.get(context, id);
  if (!existingColumn) {
    throw new ResourceNotFoundError("Column");
  }

  // Apply any additional validations for updates, if necessary
  return columnRepository.update(context, id, data);
};

const remove = async (
  context: Prisma.TransactionClient,
  id: Column["id"]
): Promise<void> => {
  const existingColumn = await columnRepository.get(context, id);
  if (!existingColumn) {
    throw new ResourceNotFoundError("Column");
  }

  await columnRepository.remove(context, id);
};

// Export the service as an object
export const columnService = {
  create,
  get,
  update,
  remove,
};
