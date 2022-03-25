import * as Joi from "joi";

export const bodyUpdateEwalletSchema = Joi.object({
    identificationcard: Joi.string().required(),
    identificationimage: Joi.array().required(),
    ewalletcode: Joi.string().allow(null).allow(""),
    ewalletsecret: Joi.string().allow(null).allow(""),
});

export const checkExistEmailQuerySchema = Joi.object({
    email: Joi.string().required(),
  });

  export const validSuppIdsBodySchema = Joi.object({
    supplierIds: Joi.array().required(),
  });