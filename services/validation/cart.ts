import * as Joi from "joi";

export const createAndUpdateBodyCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(0),
  inCampaign: Joi.boolean(),
  typeofproduct: Joi.string().allow(null).allow("").default(""),
});

export const paramCartSchema = Joi.object({
  cartId: Joi.string().required(),
});
