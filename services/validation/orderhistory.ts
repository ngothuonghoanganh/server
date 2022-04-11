import * as Joi from "joi";


export const queryOrderHistoryIdSchema = Joi.object({
  id: Joi.string().required(),
});

export const bodyOrderCodeSchema = Joi.object({
  orderCode: Joi.string().required(),
});

export const bodyOrderCodeListSchema = Joi.object({
  orderCodes: Joi.array().required(),
});

export const bodyOrderUpdateStatusSchema = Joi.object({
  orderId: Joi.string().required(),
  orderCode: Joi.string().required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.array().required(),
  status: Joi.string().required(),
});