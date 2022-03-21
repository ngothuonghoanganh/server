import * as Joi from "joi";


export const queryOrderHistoryIdSchema = Joi.object({
    retailHistoryId: Joi.string().required(),
  });

  export const bodyOrderIdSchema = Joi.object({
    orderId: Joi.string().required(),
  });