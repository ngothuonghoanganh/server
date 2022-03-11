
import * as Joi from "joi";

export const getChatMessageBodySchema = Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
});

export const updateStatusBodySchema = Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
});

