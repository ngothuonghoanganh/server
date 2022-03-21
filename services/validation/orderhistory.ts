import * as Joi from "joi";


export const queryOrderHistoryIdSchema = Joi.object({
    id: Joi.string().required(),
  });

  export const bodyOrderIdSchema = Joi.object({
    orderId: Joi.string().required(),
  });