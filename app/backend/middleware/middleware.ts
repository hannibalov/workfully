import { BasicError, ResourceNotFoundError } from "@/shared/utils/errors";
import prisma from "../../../lib/prisma";
import Koa from "koa";

// Middleware to handle transactions
export async function withTransaction(
  ctx: Koa.Context,
  next: () => Promise<any>
) {
  try {
    return await prisma.$transaction(async (tx) => {
      ctx.status = 200;
      ctx.state.tx = tx; // Store the transaction client in the context
      await next();
    });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      ctx.status = 404;
    } else if (error instanceof BasicError) {
      ctx.status = 400;
    } else {
      console.error(error);
      ctx.status = 500;
    }
    ctx.body = { error: (error as Error).message };
  }
}
