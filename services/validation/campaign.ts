import * as Joi from "joi";

export const bodySchema = Joi.object({
  productId: Joi.string().required(),
  fromDate: Joi.date().required(),
  toDate: Joi.date().required(),
  quantity: Joi.number().integer().min(0).required(),
  price: Joi.number().min(0).required(),
  isShare: Joi.boolean().required(),
  maxQuantity: Joi.number().min(0).required(),
});

export const paramsSchema = Joi.object({
  campaignId: Joi.string().required(),
});

export const querySchema = Joi.object({
  supplierId: Joi.string().allow(null).allow("").default(""),
});
