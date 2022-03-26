import * as Joi from "joi";

export const getNotifByUserIdQuerySchema = Joi.object({
    userId: Joi.string().required(),
  });