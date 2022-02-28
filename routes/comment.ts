import * as express from "express";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";

// khởi tạo validator
import Comment from "../controllers/comment";
import { createCommentBodySchema, getCommentByIdParamSchema, getCommentByOrderIdQuerySchema } from "../services/validation/comment";

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
    validator.query(getCommentByOrderIdQuerySchema),
    Comment.getCommentByOrderId
  );

  router.get(
    "/:commentId",
    validator.params(getCommentByIdParamSchema),
    Comment.getCommentById
  );

export default router;
