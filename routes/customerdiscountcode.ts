import * as express from "express";
import { createValidator } from "express-joi-validation";

// khởi tạo validator
import authentication from "../controllers/authentication";
import customerDiscountCode from "../controllers/customerdiscountcode";
import { createCustomerDiscountCodeSchema, getByStatusQuerySchema, reduceDiscountCodeBodySchema } from "../services/validation/customerdiscountcode";

const validator = createValidator();

const router = express.Router();

router.post(
  "/",
  authentication.protected,
  authentication.checkRole(["Supplier"]),
  validator.body(createCustomerDiscountCodeSchema),
  customerDiscountCode.createCustomerDiscountCode
);

router.get(
  '/getByStatus',
  authentication.protected,
  authentication.checkRole(["Customer"]),
  validator.query(getByStatusQuerySchema),
  customerDiscountCode.getListDiscountCodeByStatus
);

router.post(
  '/usedOneDiscountCode',
  authentication.protected,
  authentication.checkRole(["Customer"]),
  validator.body(reduceDiscountCodeBodySchema),
  customerDiscountCode.reduceDiscountUse
)

router.post(
  '/productIds',
  authentication.protected,
  authentication.checkRole(["Customer"]),
  validator.body(reduceDiscountCodeBodySchema),
  customerDiscountCode.getListCustomerDiscountCodeBySuppId
)



export default router;
