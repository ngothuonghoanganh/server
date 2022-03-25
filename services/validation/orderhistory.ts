import * as Joi from "joi";


export const queryOrderHistoryIdSchema = Joi.object({
    id: Joi.string().required(),
  });

  export const bodyOrderCodeSchema = Joi.object({
    orderCode: Joi.string().required(),
  });

  export const bodyOrderCodeListSchema = Joi.object({
    orderCodes: Joi.array().required(),
  });