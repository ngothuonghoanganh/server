import * as express from "express";
import { createValidator } from "express-joi-validation";

import Authentication from "../controllers/authentication";
import Product from "../controllers/product";
import {
  activeProductById,
  bodyProductIdsSchema,
  createBodyProductSchema,
  getAllProductByStatus,
  getAllProdWithStatus,
  listCatesIdBodySchema,
  paramProductIdSchema,
  updateBodyProductSchema,
} from "../services/validation/product";

const router = express.Router();

const validator = createValidator();
// api này dành cho inspector, customer, guest gọi để lấy toàn bộ sản phẩm ra
// nên không cần phải có role và authentiation
// vì không cần cái đó nên là userId phải được truyền vào từ query chứ không phải lấy từ request như các thằng khác
router.get(
  "/",
  // Authentication.protected,
  Product.getAllProductAndSupplierInformation
);

router.put(
  "/:productId",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.params(paramProductIdSchema),
  validator.body(updateBodyProductSchema),
  Product.updateProduct
);

router.post(
  "/",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.body(createBodyProductSchema),
  Product.createNewProduct
);

router.post(
  '/getListProductByCates',
  validator.body(listCatesIdBodySchema),
  Product.getListProductByCates
)

router.post(
  '/products/rating',
  validator.body(bodyProductIdsSchema),
  Product.getRatingByListProducts

)

router.post(
  '/activeProduct/id',
  // validator.body(activeProductById),
  Product.activeProductById
)

router.post(
  '/searchProduct',
  Product.searchProduct
)

router.post(
  '/getAllProdWithCampaignStatus',
  validator.body(getAllProdWithStatus),
  Product.getAllProdWithCampaignStatus

)

router.post(
  '/getAllProductByStatus',
  validator.body(getAllProductByStatus),
  Product.getAllProductByStatus
)


router.get(
  '/getProductCreatedThisWeek',
  Product.getProductCreatedThisWeek
)

// ở đây cũng lấy toàn bộ product ra nhưng để cho supplier quản lý nên là cần authentication
// và check cả role của nó nên là userId lấy từ request

router.get(
  '/getProductWithOrderCompleted',
  Product.getProductWithOrderCompleted
)


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
  Product.disableProduct
);


// no use
// router.get(
//   "/products/:supplierId",
//   // Authentication.protected,
//   // Authentication.checkRole(["Supplier", "Inspector"]),
//   validator.params(querySupplierIdSchema),
//   Product.getAllProductsBySupplierId
// );
export default router;
