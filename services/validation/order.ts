import * as Joi from "joi";

export const createOrderBodySchema = Joi.object({
    customerId: Joi.string().required(),
    productId: Joi.string().required(),
    productName: Joi.string().required(),
    quantity: Joi.number().integer().min(0),
    iswholesale: Joi.boolean(),
    price: Joi.number().min(0),
    typeofproduct: Joi.string().allow(null).allow(""),
    customerDiscountCodeId: Joi.string().allow(null).allow(""),
    isWholeSale: Joi.boolean(),
    status: Joi.string().required(),
    campaignId: Joi.string().allow(null).allow(""),
    addressId: Joi.string().allow(null).allow(""),
    paymentId: Joi.string().allow(null).allow(""),
    discountPrice: Joi.string().allow(null).allow(""),
    shippingFee: Joi.number().min(0),
    notes: Joi.string().allow(null).allow(""),
});

