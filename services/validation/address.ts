import * as Joi from "joi";

export const createNewAddressSchema = Joi.object({
    provinceId: Joi.string().required(),
    province: Joi.string().required(),
    districtId: Joi.string().required(),
    district: Joi.string().required(),
    wardId: Joi.string().required(),
    ward: Joi.string().required(),
    street: Joi.string().required(),

});

export const updateAddressParamSchema = Joi.object({
    addressId: Joi.string().required()
});

export const updateAddressBodySchema = Joi.object({
    provinceId: Joi.string().required(),
    province: Joi.string().required(),
    districtId: Joi.string().required(),
    district: Joi.string().required(),
    wardId: Joi.string().required(),
    ward: Joi.string().required(),
    street: Joi.string().required(),
});

export const deleteAddressParamSchema = Joi.object({
    addressId: Joi.string().required()
});