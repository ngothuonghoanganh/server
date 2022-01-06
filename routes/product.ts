import * as express from "express";
import { createValidator } from "express-joi-validation";
import { val, Validator } from "objection";

import Authentication from "../controllers/authentication";
import Product from "../controllers/product";
import { updateParamSchema } from "../services/validation/category";
import { createBodyProductSchema, paramProductIdSchema, supplierIdSchema, updateBodyProductSchema } from "../services/validation/product";


const router = express.Router();

const validator = createValidator();
// api này dành cho inspector, customer, guest gọi để lấy toàn bộ sản phẩm ra
// nên không cần phải có role và authentiation
// vì không cần cái đó nên là userId phải được truyền vào từ query chứ không phải lấy từ request như các thằng khác
router.get(
  "/",
  // Authentication.protected,
  // Authentication.checkRole(["Supplier"]),
  Product.getAllProduct
);

<<<<<<< HEAD
// router.put(
//   "/:productId",
//   Authentication.protected,
//   Authentication.checkRole(["Supplier"]),
  //   validator.params(paramProductIdSchema),
  //   validator.headers(supplierIdSchema),
  //   validator.body(updateBodyProductSchema),
  // Product.updateProduct
// );
=======
router.put(
  "/:productId",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  Product.updateProduct
);
>>>>>>> 8e86b5c454a3dfc6e82953e66eb2a50fd108893f

router.post(
  "/",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.body(createBodyProductSchema),
  validator.headers(supplierIdSchema),
  Product.createNewProduct
);

// ở đây cũng lấy toàn bộ product ra nhưng để cho supplier quản lý nên là cần authentication
// và check cả role của nó nên là userId lấy từ request
router.get(
  "/All",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  Product.getAllProductsAndCates
);

router.get(
  "/:productId",
  validator.params(paramProductIdSchema),
  Product.getProductById
  );

router.delete(
  "/:productId",
  Authentication.protected,
  Authentication.checkRole(["Supplier", "Inspector"]),
  validator.params(paramProductIdSchema),
  Product.deleteProduct
);

export default router;
