import * as Joi from "joi";

export const createCommentBodySchema = Joi.object({
    orderDetailId: Joi.string().required(),
    productId: Joi.string().required(),
    comment: Joi.string().required(),
    customerId:Joi.string().required(),
    rating: Joi.number().allow(null).allow(""),
});

export const getCommentByIdParamSchema = Joi.object({
    commentId: Joi.string().required(),
});

export const getCommentByOrderDetailIdQuerySchema = Joi.object({
    orderDetailId: Joi.string().required(),
});

export const getCommentByProductIdParamSchema = Joi.object({
    productId: Joi.string().required(),
});