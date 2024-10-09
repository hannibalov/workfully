import prisma from "../../../lib/prisma";
import Koa from "koa";

// Middleware to handle transactions
export async function withTransaction(
  ctx: Koa.Context,
  next: () => Promise<any>
) {
  try {
    return await prisma.$transaction(async (tx) => {
      ctx.state.tx = tx; // Store the transaction client in the context
      await next();
    });
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
}
