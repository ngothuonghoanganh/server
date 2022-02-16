import * as Joi from "joi";

export const createBodyDiscountCodeSchema = Joi.object({
    code: Joi.string().required(),
    description: Joi.string().allow(null).allow(""),
    condition: Joi.array(),
    percent: Joi.number().integer().min(0),
    startDate: Joi.string().allow(null).allow("").default(""),
    endDate: Joi.string().allow(null).allow("").default(""),
    quantity: Joi.number().integer().min(0),
    productId: Joi.string().required(),
    minimunPriceCondition: Joi.number().integer().min(0),
    discountPrice: Joi.number().integer().min(0)
});

export const paramDiscountCodeIdSchema = Joi.object({
    discountCodeId: Joi.string().required(),
})

export const updateDiscountCodeSchema = Joi.object({
    code: Joi.string().required(),
    description: Joi.string().allow(null).allow("").default(""),
    minimunPriceCondition: Joi.number().integer().min(0).required(),
    startDate: Joi.date().allow(""),
    endDate: Joi.date().allow(""),
    quantity: Joi.number().integer().min(0).required(),
    discountPrice: Joi.number().integer().min(0).required(),
    productId: Joi.string().required(),
})

export const bodySupplierIdSchema = Joi.object({
    supplierId: Joi.string().required(),
})