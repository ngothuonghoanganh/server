import * as Joi from "joi";

export const createBodyProductSchema = Joi.object({
  name: Joi.string().required(),
  retailPrice: Joi.number().min(0),
  quantity: Joi.number().integer().min(0),
  description: Joi.string().required(),
  image: Joi.array(),
  categoryId: Joi.string().allow(null).allow(""),
  status: Joi.string().allow(null).allow(""),
  typeofproduct: Joi.string().allow(null).allow(""),
});

export const paramProductIdSchema = Joi.object({
  productId: Joi.string().required(),
});

export const listCatesIdBodySchema = Joi.object({
  listCategories: Joi.array().required(),
});

export const activeProductById = Joi.object({
  productId: Joi.string().required(),
});

export const bodyProductIdsSchema = Joi.object({
  productIds: Joi.array().required(),
});


export const querySupplierIdSchema = Joi.object({
  supplierId: Joi.string().required(),
});

export const supplierIdSchema = Joi.object({
  supplierId: Joi.string().required(),
});

export const updateBodyProductSchema = Joi.object({
  name: Joi.string().required(),
  retailPrice: Joi.number().min(0),
  quantity: Joi.number().integer().min(0),
  description: Joi.string().required(),
  image: Joi.array(),
  categoryId: Joi.string().allow(null).allow(""),
  status: Joi.string().allow(null).allow(""),
  typeofproduct: Joi.string().allow(null).allow(""),
});
