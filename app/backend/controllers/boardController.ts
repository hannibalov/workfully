import Joi from "joi";
import Koa from "koa";
import { boardService } from "../services/boardService";
import { validatePayload } from "@/shared/utils/validation";

// Define validation schemas
const boardSchema = Joi.object({
  title: Joi.string().required(),
  projectId: Joi.number().integer().required(),
});

const idSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const get = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { params: idSchema });
  const { id } = ctx.params;
  const board = await boardService.get(ctx.state.tx, id);
  ctx.body = board;
};

const create = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { body: boardSchema });
  const payload = ctx.request.body;
  const newBoard = await boardService.create(ctx.state.tx, payload);
  ctx.status = 201;
  ctx.body = newBoard;
};

const update = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { params: idSchema });
  const payload = ctx.request.body;
  const board = await boardService.update(ctx.state.tx, payload.id, payload);
  ctx.body = board;
};

const remove = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { params: idSchema });
  const { id } = ctx.params;
  ctx.body = await boardService.remove(ctx.state.tx, id);
};

export const boardController = {
  get,
  create,
  update,
  remove,
};
