import * as Joi from "joi";

export const bodyLoginSchema = Joi.object({
  username: Joi.string().required().messages({
    any: `username is a required field`,
  }),
  password: Joi.string().required().messages({
    "any.required": `password is a required field`,
  }),
});

export const bodyRegisterSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  firstName: Joi.string().allow(null).allow(""),
  lastName: Joi.string().allow(null).allow(""),
  email: Joi.string().required(),
  phone: Joi.string().allow(null).allow(""),
  address: Joi.object().allow(null).allow({}),
  roleName: Joi.string().allow(null).allow(""),
  identificationCard: Joi.string().required(),
  identificationImage: Joi.array().required(),
});
