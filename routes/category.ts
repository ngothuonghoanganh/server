import * as express from "express";
import { createValidator } from "express-joi-validation";

// khởi tạo validator
import authentication from "../controllers/authentication";
import category from "../controllers/category";

import { createBodySchema, getQuerySchema, updateParamSchema } from "../services/validation/category";
// import { AuthenticationController } from "../controllers/authentication";
// import { CateController } from "../controllers/category";
const validator = createValidator();

const router = express.Router();

router.post(
  "/",
  authentication.protected,
  authentication.checkRole(["Supplier"]),
  validator.body(createBodySchema),
  category.createNewCate
);

router.get(
  "/all",
  authentication.protected,
  category.getAllCate
);

router.put(
  "/:categoryId",
  authentication.protected,
  authentication.checkRole(["Supplier"]),
  validator.params(updateParamSchema),
  validator.body(createBodySchema),
  category.updateCate
);

router.delete(
  '/:categoryId',
  authentication.protected,
  authentication.checkRole(['Supplier']),
  validator.params(updateParamSchema),
  category.deleteCate
)

router.get(
  '/',
  validator.query(getQuerySchema),
  category.getAllCateByQuery
)

// // Categories mobile
// router.get("/:userId", CateController.getAllCateMobi);
// router.get("/:categoryId", CateController.getOne);

export default router;
