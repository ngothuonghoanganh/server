import * as express from "express";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";

// khởi tạo validator
import Comment from "../controllers/comment";
import { countNumOfCommentByProductId, createCommentBodySchema, disableComment, getCommentByIdParamSchema, getCommentByOrderId, getCommentByProductIdParamSchema } from "../services/validation/comment";

const validator = createValidator();

const router = express.Router();

router.post(
  "/",
  authentication.protected,
  authentication.checkRole(["Customer"]),
  validator.body(createCommentBodySchema),
  Comment.updateComment
);

router.post(
  "/comment/id",
  // validator.body(getCommentByOrderId),
  Comment.getCommentByOrderId
);
router.post(
  "/product/order",
  // validator.params(getCommentByIdParamSchema),
  Comment.countNumOfOrderCompleted
);

// router.post(
//   "/countComments",
//   validator.body(countNumOfCommentByProductId),
//   Comment.countNumOfCommentByProductId
// );

router.put(
  '/disable/id',
  authentication.protected,
  validator.body(disableComment),
  Comment.disableComment
);

router.get(
  "/product/:productId",
  validator.params(getCommentByProductIdParamSchema),
  Comment.getCommentByProductId
);

// router.get(
//   "/:commentId",
//   validator.params(getCommentByIdParamSchema),
//   Comment.getCommentById
// );



export default router;
