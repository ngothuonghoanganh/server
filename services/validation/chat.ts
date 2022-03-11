
import * as Joi from "joi";

export const getChatMessageBodySchema = Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
});