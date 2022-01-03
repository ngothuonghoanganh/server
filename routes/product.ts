import * as express from "express";
import { createValidator } from "express-joi-validation";

import  authentication  from "../controllers/authentication";
import  product from "../controllers/product";

const router = express.Router();

// router.get(
//   "/",
//   // AuthenticationController.protected,
//   // AuthenticationController.checkRole(["Supplier"]),
//   ProductController.getAllProduct
// );

// router.put(
//   "/:productId",
//   AuthenticationController.protected,
//   AuthenticationController.checkRole(["Supplier"]),
//   ProductController.updateProduct
// );

router.post(
  "/",
  authentication.protected,
  authentication.checkRole(["Supplier"]),
  product.createNewProduct
);

// router.get(
//   "/All",
//   AuthenticationController.protected,
//   AuthenticationController.checkRole(["Supplier"]),
//   ProductController.getAllProductsAndCates
// );

// router.get("/:productId", ProductController.getProductById);

// router.delete(
//   "/:productId",
//   AuthenticationController.protected,
//   AuthenticationController.checkRole(["Supplier"]),
//   ProductController.deleteProduct
// );

export default router;
