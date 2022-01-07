import * as Joi from "joi";

export const createBodyProductSchema = Joi.object({
  name: Joi.string().required(),
  retailPrice: Joi.number().integer(),
  quantity: Joi.number().integer(),
  description: Joi.string().required(),
  image: Joi.array().items(Joi.string()),
  categoryId: Joi.string().allow(null).allow(""),
  status: Joi.string().allow(null).allow(""),
  typeofproduct: Joi.string().allow(null).allow(""),
});

export const paramProductIdSchema = Joi.object({
  productId: Joi.string().required(),
});

export const supplierIdSchema = Joi.object({
  supplierId: Joi.string().required(),
});

export const updateBodyProductSchema = Joi.object({
  name: Joi.string().required(),
  retailPrice: Joi.number().integer(),
  quantity: Joi.number().integer(),
  description: Joi.string().required(),
  image: Joi.array().items(Joi.string()),
  categoryId: Joi.string().allow(null).allow(""),
  status: Joi.string().allow(null).allow(""),
  typeofproduct: Joi.string().allow(null).allow(""),
});