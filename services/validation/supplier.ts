import * as Joi from "joi";

export const bodyUpdateEwalletSchema = Joi.object({
    identificationcard: Joi.string().required(),
    identificationimage: Joi.array().required(),
    ewalletcode: Joi.string().required(),
    ewalletsecret: Joi.string().required(),
});