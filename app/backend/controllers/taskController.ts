import Joi from "joi";
import Koa from "koa";
import { taskFacade } from "../facades/taskFacade";
import { taskStatuses } from "../../shared/constants";

// Define validation schemas
const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
});

const updateStatusSchema = Joi.object({
  id: Joi.number().integer().required(),
  status: Joi.string()
    .valid(...taskStatuses)
    .required(),
});

// Helper function to validate payloads
async function validatePayload(ctx: Koa.Context, schema: Joi.Schema) {
  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
}

const getAll = async (ctx: Koa.Context) => {
  const tasks = await taskFacade.getAll(ctx.state.tx);
  ctx.body = tasks;
};

const addTask = async (ctx: Koa.Context) => {
  try {
    const payload = await validatePayload(ctx, taskSchema);
    const newTask = await taskFacade.create(ctx.state.tx, payload);
    ctx.status = 201;
    ctx.body = newTask;
  } catch (e) {
    ctx.status = 400;
    ctx.body = { error: (e as Error).message };
  }
};

const updateTaskStatus = async (ctx: Koa.Context) => {
  try {
    const payload = await validatePayload(ctx, updateStatusSchema);
    const task = await taskFacade.updateStatus(ctx.state.tx, {
      id: payload.id,
      status: payload.status,
    });

    if (!task) {
      ctx.status = 404;
      ctx.body = { error: "Task not found" };
    } else {
      ctx.body = task;
    }
  } catch (e) {
    ctx.status = 400;
    ctx.body = { error: (e as Error).message };
  }
};

export const taskController = {
  getAll,
  addTask,
  updateTaskStatus,
};
