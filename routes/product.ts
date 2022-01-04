import * as express from "express";
import { ProductController } from "../controllers/product";
import { AuthenticationController } from "../controllers/authentication";
import { Products } from "../models/product";

const router = express.Router();

// api này dành cho inspector, customer, guest gọi để lấy toàn bộ sản phẩm ra
// nên không cần phải có role và authentiation
// vì không cần cái đó nên là userId phải được truyền vào từ query chứ không phải lấy từ request như các thằng khác
router.get(
  "/",
  // AuthenticationController.protected,
  // AuthenticationController.checkRole(["Supplier"]),
  ProductController.getAllProduct
);

router.put(
  "/:productId",
  AuthenticationController.protected,
  AuthenticationController.checkRole(["Supplier"]),
  ProductController.updateProduct
);

router.post(
  "/",
  AuthenticationController.protected,
  AuthenticationController.checkRole(["Supplier"]),
  ProductController.createNewProduct
);

// ở đây cũng lấy toàn bộ product ra nhưng để cho supplier quản lý nên là cần authentication
// và check cả role của nó nên là userId lấy từ request
router.get(
  "/All",
  AuthenticationController.protected,
  AuthenticationController.checkRole(["Supplier"]),
  ProductController.getAllProductsAndCates
);

router.get("/:productId", ProductController.getProductById);

router.delete(
  "/:productId",
  AuthenticationController.protected,
  AuthenticationController.checkRole(["Supplier"]),
  ProductController.deleteProduct
);

export default router;
