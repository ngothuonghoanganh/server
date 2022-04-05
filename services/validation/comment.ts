import * as Joi from "joi";

export const createCommentBodySchema = Joi.object({
    comment: Joi.string().required(),
    orderId:Joi.string().required(),
    rating: Joi.number().allow(null).allow(""),
    isCampaign: Joi.boolean().required(),
});

export const getCommentByIdParamSchema = Joi.object({
    commentId: Joi.string().required(),
});

export const getCommentByOrderId = Joi.object({
    orderId: Joi.string().required(),
    isCampaign: Joi.boolean().required(),
});

export const getCommentByProductIdParamSchema = Joi.object({
    productId: Joi.string().required(),
});

export const countNumOfCommentByProductId = Joi.object({
    productId: Joi.string().required(),
});