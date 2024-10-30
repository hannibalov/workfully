import Joi from "joi";
import Koa from "koa";
import { BasicError } from "./errors"; // Adjust the import according to your structure

// Helper function to validate payloads
export async function validatePayload(
  ctx: Koa.Context,
  schema: { params?: Joi.Schema; body?: Joi.Schema }
) {
  // Validate parameters if provided
  if (schema.params) {
    const { error } = schema.params.validate(ctx.params);
    if (error) {
      throw new BasicError(error.details[0].message);
    }
  }

  // Validate body if provided
  if (schema.body) {
    const { error } = schema.body.validate(ctx.request.body);
    if (error) {
      throw new BasicError(error.details[0].message);
    }
  }
}
