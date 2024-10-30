import Joi from "joi";
import Koa from "koa";
import { columnService } from "../services/columnService";
import { validatePayload } from "@/shared/utils/validation";

// Define validation schemas
const columnSchema = Joi.object({
  title: Joi.string().required(),
  boardId: Joi.number().integer().required(),
});

const idSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const get = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { params: idSchema });
  const { id } = ctx.params;
  const column = await columnService.get(ctx.state.tx, id);
  ctx.body = column;
};

const create = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { body: columnSchema });
  const payload = ctx.request.body;
  const newColumn = await columnService.create(ctx.state.tx, payload);
  ctx.status = 201;
  ctx.body = newColumn;
};

const update = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { params: idSchema });
  const payload = ctx.request.body;
  const column = await columnService.update(ctx.state.tx, payload.id, payload);
  ctx.body = column;
};

const remove = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { params: idSchema });
  const { id } = ctx.params;
  await columnService.remove(ctx.state.tx, id);
};

export const columnController = {
  get,
  create,
  update,
  remove,
};
