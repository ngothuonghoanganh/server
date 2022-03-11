
import * as Joi from "joi";

export const getChatMessageBodySchema = Joi.object({
    supplierId: Joi.string().allow(null).allow("").default(""),
    customerService: Joi.string().allow(null).allow("").default("")
});