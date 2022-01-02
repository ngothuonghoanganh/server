import * as Joi from "joi";

export const createBodySchema = Joi.object({
    categoryName: Joi.string().required(),
})