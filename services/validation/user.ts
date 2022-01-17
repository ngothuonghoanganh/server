import * as Joi from "joi";

export const getSupplierParamsSchema = Joi.object({
  supplierId: Joi.string().required(),
});

export const getCustomerParamsSchema = Joi.object({
  customerId: Joi.string().required(),
});
