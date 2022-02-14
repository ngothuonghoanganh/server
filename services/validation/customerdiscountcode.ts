import * as Joi from "joi";

export const createCustomerDiscountCodeSchema = Joi.object({
    discountCodeId: Joi.string().required(),
    quantity: Joi.number().min(0),
    customerId: Joi.string().required(),
});