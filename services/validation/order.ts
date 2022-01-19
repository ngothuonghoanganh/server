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
    status: Joi.string().required(),
    campaignId: Joi.string().allow(null).allow(""),
    addressId: Joi.string().required(),
    paymentId: Joi.string().required(),
    discountprice: Joi.string().allow(null).allow(""),
    shippingfee: Joi.number().min(0),
    notes: Joi.string().allow(null).allow(""),
});

