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

export const validProcessingToDeliveringSchema = Joi.object({
  orderCode: Joi.string().required(),
  orderId: Joi.string().required(),
  type: Joi.string().required(),
  // description: Joi.string().required(),
  image: Joi.array().required(),
});

export const validDeliveredToReturningSchema = Joi.object({
  orderCode: Joi.string().required(),
  orderId: Joi.string().required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.array().required(),
});

export const validDeliveredToCompletedSchema = Joi.object({
  orderCode: Joi.string().required(),
  orderId: Joi.string().required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  // image: Joi.array().required(),
});

export const validReturningToReturnedSchema = Joi.object({
  orderCode: Joi.string().required(),
  orderId: Joi.string().required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  // image: Joi.array().required(),
});

export const changeStatusToProcessingSchema = Joi.object({
  orderCode: Joi.string().required(),
});

export const validStatusForDeliverydSchema = Joi.object({
  orderCode: Joi.string().required(),
  status: Joi.string().required(),
});

export const validStatusForCreatedToProcessingForSupplierSchema = Joi.object({
  orderCode: Joi.string().required(),
  orderId: Joi.string().required(),
  type: Joi.string().required(),
});

export const getOrderByIdSchema = Joi.object({
  orderId: Joi.string().required(),
});

export const getByOrderCodeQuerySchema = Joi.object({
  orderCode: Joi.string().required(),
});

export const validDeliveringToDeliveredSchema = Joi.object({
  orderCode: Joi.string().required(),
  type: Joi.string().required(),
  orderId: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.array().required(),
  supplierId: Joi.string().required(),
});

export const updateStatusFromDeliveringToCancelledForDelivery = Joi.object({
  orderCode: Joi.string().required(),
  type: Joi.string().required(),
  orderId: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.array().required(),
  supplierId: Joi.string().required(),
});

export const updateStatusFromReturningToDeliveredForRejectReturn = Joi.object({
  orderCode: Joi.string().required(),
  status: Joi.string().allow(null).allow(""),
  type: Joi.string().required(),
  orderId: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.array().required(),
  supplierId: Joi.string().required(),
});

export const validUpdateStatusToCancelCustomerBodySchema = Joi.object({
  orderCode: Joi.string().required(),
  type: Joi.string().required(),
  orderId: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.array().required(),
});

export const validUpdateStatusToCancelSupplierBodySchema = Joi.object({
  orderCode: Joi.string().required(),
  type: Joi.string().required(),
  orderId: Joi.string().required(),
  image: Joi.array().required(),
  description: Joi.string().required(),
  cancelLinkRequestor: Joi.string().required(),
  supplierId: Joi.string().required(),
});

export const getOrderForDeliveryQuerySchema = Joi.object({
  status: Joi.string().required(),
});
