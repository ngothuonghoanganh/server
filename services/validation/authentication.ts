import * as Joi from "joi";

export const bodySchema = Joi.object({
  username: Joi.string().required().messages({
    "any": `username is a required field`,
  }),
  password: Joi.string().required().messages({
    "any.required": `password is a required field`,
  }),
});
