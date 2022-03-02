import * as express from "express";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";

// khởi tạo validator
import Comment from "../controllers/comment";
import { createCommentBodySchema, getCommentByIdParamSchema, getCommentByOrderDetailIdQuerySchema, getCommentByProductIdParamSchema } from "../services/validation/comment";

const validator = createValidator();

const router = express.Router();

router.post(
    "/",
    authentication.protected,
    authentication.checkRole(["Customer"]),
    validator.body(createCommentBodySchema),
    Comment.CreateNewComment
  );

  router.get(
    "/",
    validator.query(getCommentByOrderDetailIdQuerySchema),
    Comment.getCommentByOrderDetailId
  );
  router.get(
    "/product/order",
    // validator.params(getCommentByIdParamSchema),
    Comment.countNumOfOrderCompleted
  );

  router.post(
    "/countComments",
    // validator.body(getCommentByProductIdBodySchema),
    Comment.countNumOfCommentByProductId
  );

  router.get(
    "/product/:productId",
    validator.params(getCommentByProductIdParamSchema),
    Comment.getCommentByProductId
  );

  router.get(
    "/:commentId",
    validator.params(getCommentByIdParamSchema),
    Comment.getCommentById
  );

  

export default router;
