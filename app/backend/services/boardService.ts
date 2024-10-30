import { Prisma, Board, Column, Project } from "@prisma/client";
import { boardRepository } from "../repositories/boardRepository";
import {
  BasicError,
  errorMessages,
  ResourceNotFoundError,
} from "@/shared/utils/errors";
import { columnRepository } from "../repositories/columnRepository";

const create = async (
  context: Prisma.TransactionClient,
  data: { title: string; projectId: Project["id"] }
): Promise<Board> => {
  if (!data.title || data.title.trim() === "" || !data.projectId) {
    throw new BasicError(
      errorMessages.PARAMETER_MISSING("Board title or projectId")
    );
  }

  // Add any other business logic validations or transformations here
  return boardRepository.create(context, data);
};

const get = async (
  context: Prisma.TransactionClient,
  id: Board["id"]
): Promise<(Board & { columns: Column[] }) | null> => {
  const board = await boardRepository.get(context, id);
  if (!board) {
    throw new ResourceNotFoundError("Board");
  }
  const columns = await columnRepository.getAllInBoard(context, id);
  return { ...board, columns };
};

const update = async (
  context: Prisma.TransactionClient,
  id: Board["id"],
  data: Partial<Board>
): Promise<Board | null> => {
  const existingBoard = await boardRepository.get(context, id);
  if (!existingBoard) {
    throw new ResourceNotFoundError("Board");
  }

  // Apply any additional validations for updates, if necessary
  return boardRepository.update(context, id, data);
};

const remove = async (
  context: Prisma.TransactionClient,
  id: Board["id"]
): Promise<Board> => {
  const existingBoard = await boardRepository.get(context, id);
  if (!existingBoard) {
    throw new ResourceNotFoundError("Board");
  }

  return await boardRepository.remove(context, id);
};

// Export the service as an object
export const boardService = {
  create,
  get,
  update,
  remove,
};
