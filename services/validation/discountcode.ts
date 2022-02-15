import * as Joi from "joi";

export const createBodyDiscountCodeSchema = Joi.object({
    code: Joi.string().required(),
    description: Joi.string().allow(null).allow(""),
    startDate: Joi.string().allow(null).allow("").default(""),
    endDate: Joi.string().allow(null).allow("").default(""),
    quantity: Joi.number().integer().min(0),
    productId: Joi.string().required(),
    minimunPriceCondition:Joi.number().integer().min(0),
    discountPrice:Joi.number().integer().min(0)
});

export const paramDiscountCodeIdSchema = Joi.object({
    discountCodeId: Joi.string().required(),
})

export const bodySupplierIdSchema = Joi.object({
    supplierId: Joi.string().required(),
})