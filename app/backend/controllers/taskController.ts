import Joi from "joi";
import Koa from "koa";
import { taskService } from "../services/taskService";
import { validatePayload } from "@/shared/utils/validation";

// Define validation schemas
const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  columnId: Joi.number().integer().required(),
});

const idSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const getAllSchema = Joi.object({
  boardId: Joi.number().integer().required(),
});

const get = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { params: idSchema });
  const { id } = ctx.params;
  const task = await taskService.get(ctx.state.tx, id);
  ctx.body = task;
};

const create = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { body: taskSchema });
  const payload = ctx.request.body;
  const newTask = await taskService.create(ctx.state.tx, payload);
  ctx.status = 201;
  ctx.body = newTask;
};

const update = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { params: idSchema });
  const payload = ctx.request.body;
  const task = await taskService.update(ctx.state.tx, payload.id, payload);
  ctx.body = task;
};

const remove = async (ctx: Koa.Context) => {
  await validatePayload(ctx, { params: idSchema });
  const { id } = ctx.params;
  await taskService.remove(ctx.state.tx, id);
};

export const taskController = {
  get,
  create,
  update,
  remove,
};
