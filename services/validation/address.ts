import * as Joi from "joi";

export const createNewAddressSchema = Joi.object({
    province: Joi.string().required(),
    street:Joi.string().required()
});

export const updateAddressParamSchema = Joi.object({
    addressId: Joi.string().required()
});

export const deleteAddressParamSchema = Joi.object({
    addressId: Joi.string().required()
});