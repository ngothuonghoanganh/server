import * as express from "express";
import { createValidator } from "express-joi-validation";
import { auth } from "firebase-admin";

// khởi tạo validator
import authentication from "../controllers/authentication";
import discountcode from "../controllers/discountcode";
import {
  bodySupplierIdSchema,
  createBodyDiscountCodeSchema,
  paramDiscountCodeIdSchema,
} from "../services/validation/discountcode";

// import { } from "../services/validation/discountcode";

const validator = createValidator();

const router = express.Router();

router.post(
  "/",
  authentication.protected,
  authentication.checkRole(["Supplier"]),
  validator.body(createBodyDiscountCodeSchema),
  discountcode.createDiscountCode
);

router.delete(
  "/:discountCodeId",
  authentication.protected,
  authentication.checkRole(["Supplier"]),
  validator.params(paramDiscountCodeIdSchema),
  discountcode.deactivateDiscountCode
);

router.put(
  "/:discountCodeId",
  authentication.protected,
  authentication.checkRole(["Supplier"]),
  validator.params(paramDiscountCodeIdSchema),
  discountcode.updateDiscountCode
);

router.get(
  "/",
  authentication.protected,
  // authentication.checkRole(['Supplier']),
  // validator.body(bodySupplierIdSchema),
  discountcode.getAllDiscountCodeBySupplierId
);

router.get(
  "/supplier",
  authentication.protected,
  // authentication.checkRole(['Supplier']),
  // validator.body(bodySupplierIdSchema),
  discountcode.getAllDiscountCodeInSupplier
);


export default router;
