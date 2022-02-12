import * as Joi from "joi";

export const createOrderBodySchema = Joi.object({
  campaignId: Joi.string().allow(null).allow(""),
  addressId: Joi.string().allow(null).allow("").required(),
  paymentId: Joi.string().allow(null).allow(""),
  discountPrice: Joi.number().allow(null).allow(""),
  shippingFee: Joi.number().allow(null).allow(""),
  products: Joi.array().required(),
  supplierId: Joi.string().required(),
});

export const changeStatusToCancelledSchema = Joi.object({
  orderCode: Joi.string().required(),
});

export const validStatusForDeleveredSchema = Joi.object({
  orderCode: Joi.string().required(),
});

export const changeStatusToProcessingSchema = Joi.object({
  orderCode: Joi.string().required(),
});

export const validStatusForDeliverydSchema = Joi.object({
  orderCode: Joi.string().required(),
  status: Joi.string().required(),
});

export const validStatusForCreatedOrAdvancedToProcessingForSupplierSchema = Joi.object({
  orderCode: Joi.string().required(),
});

export const getOrderByIdSchema = Joi.object({
  orderId: Joi.string().required(),
});

export const validOrderCodeSchema = Joi.object({
  orderCode: Joi.string().required(),
});

