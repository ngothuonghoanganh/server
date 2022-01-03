
import * as Joi from "joi";

export const createBodySchema = Joi.object({
    categoryName: Joi.string().required(),
});

export const updateParamSchema = Joi.object({
    categoryId: Joi.string().required(),
});

export const getQuerySchema = Joi.object({
    userId: Joi.string().required(),
});
