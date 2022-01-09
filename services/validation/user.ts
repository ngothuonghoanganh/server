import * as Joi from "joi";

export const getSupplierParamsSchema = Joi.object({
  supplierId: Joi.string().required(),
});
