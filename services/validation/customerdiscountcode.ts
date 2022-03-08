import * as Joi from "joi";

export const createCustomerDiscountCodeSchema = Joi.object({
    discountCodeId: Joi.string().required(),
    quantity: Joi.number().min(0),
    customerId: Joi.string().required(),
});


export const getByStatusQuerySchema = Joi.object({
    status: Joi.string().required(),
});

export const reduceDiscountCodeBodySchema = Joi.object({
    customerDiscountCodeId: Joi.string().required(),
});

export const getBydiscountCodeAndSuppIdBodySchema = Joi.object({
    discountCode: Joi.string().required(),
    supplierId: Joi.string().required()
});