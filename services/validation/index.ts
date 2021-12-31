import * as Joi from "joi";

export const querySchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.string().equal(Joi.ref("name")),
});
