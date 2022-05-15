import * as express from "express";
import { createValidator } from "express-joi-validation";

import Authentication from "../controllers/authentication";
import Product from "../controllers/product";
import {
  bodyProductIdsSchema,
  createBodyProductSchema,
  getAllProductByStatus,
  getAllProdWithStatus,
  listCatesIdBodySchema,
  paramProductIdSchema,
  paramsSupplierIdSchema,
  updateBodyProductSchema,
} from "../services/validation/product";

const router = express.Router();

const validator = createValidator();
router.get(
  "/",
  // Authentication.protected,
  Product.getAllProductAndSupplierInformation
);

router.put(
  '/active',
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  Product.activeProduct
)

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
  Authentication.protected,
  Authentication.checkRole(["Supplier", "Inspector"]),
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

router.get(
  '/getProductWithOrderCompleted',
  Product.getProductWithOrderCompleted
)

// router.get(
//   '/getAllProductCreatedByEveryMonth',
//   Product.getAllProductCreatedByEveryMonth
// )

router.get(
  "/All",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  Product.getAllProductsAndCates
);

router.put(
  "/:productId",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.params(paramProductIdSchema),
  validator.body(updateBodyProductSchema),
  Product.updateProduct
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
  // validator.params(paramProductIdSchema),
  Product.disableProduct
);


// no use
router.get(
  "/supplier/:supplierId",
  // Authentication.protected,
  // Authentication.checkRole(["Supplier", "Inspector"]),
  validator.params(paramsSupplierIdSchema),
  Product.getAllProductsBySupplierId
);
export default router;
