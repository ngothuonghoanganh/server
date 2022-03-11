import * as Joi from "joi";

export const getSupplierParamsSchema = Joi.object({
  supplierId: Joi.string().required(),
});

export const getCustomerParamsSchema = Joi.object({
  customerId: Joi.string().required(),
});

export const getCustomerOrSupplierByPhoneParamsSchema = Joi.object({
  phone: Joi.string().required(),
});

export const updateCustomerAccSchema = Joi.object({
  firstName: Joi.string().allow(null).allow(""),
  lastName: Joi.string().allow(null).allow(""),
  email: Joi.string().required(),
  avt: Joi.string().allow(null).allow(""),

});

export const resetPasswordForCustomerBodySchema = Joi.object({
  password: Joi.string().required(),
});

export const getListSupplierIdByListAccountIdBodySchema = Joi.object({
  listAccountIds: Joi.array().required(),
});
