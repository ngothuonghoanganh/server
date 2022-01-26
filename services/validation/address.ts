import * as Joi from "joi";

export const createNewAddressSchema = Joi.object({
    province: Joi.string().required(),
    street:Joi.string().required()
});