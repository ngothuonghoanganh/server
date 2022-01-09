import * as Joi from "joi";

export const createAndUpdateBodyCartSchema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(0),
    wholesale: Joi.boolean(),
    typeofproduct: Joi.string().required(),

});

export const paramCartSchema = Joi.object({
    cartId: Joi.string().required(),
});