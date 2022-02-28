import * as express from "express";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";

// khởi tạo validator
import Comment from "../controllers/comment";
import { createCommentBodySchema, getCommentByIdParamSchema, getCommentByOrderDetailIdQuerySchema, getCommentByProductIdBodySchema } from "../services/validation/comment";

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
    "/:commentId",
    validator.params(getCommentByIdParamSchema),
    Comment.getCommentById
  );

  router.post(
    "/productId",
    validator.body(getCommentByProductIdBodySchema),
    Comment.getCommentByProductId
  );

  router.post(
    "/countComments",
    // validator.body(getCommentByProductIdBodySchema),
    Comment.countNumOfCommentByProductId
  );

export default router;
