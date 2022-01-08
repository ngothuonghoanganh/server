import * as Joi from "joi";

export const createBodyDiscountCodeSchema = Joi.object({
    code: Joi.string().required(),
    description: Joi.string().allow(null).allow(""),
    condition: Joi.array(),
    percent: Joi.number().integer().min(0),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().timestamp().greater(Joi.ref('startDate')).required(),
    quantity: Joi.number().integer().min(0),
});

export const paramDiscountCodeIdSchema = Joi.object({
    discountCodeId: Joi.string().required(),
})