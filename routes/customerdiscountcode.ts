import * as express from "express";
import { createValidator } from "express-joi-validation";

// khởi tạo validator
import authentication from "../controllers/authentication";
import customerDiscountCode from "../controllers/customerdiscountcode";
import { createCustomerDiscountCodeSchema } from "../services/validation/customerdiscountcode";

const validator = createValidator();

const router = express.Router();

router.post(
  "/",
  authentication.protected,
  authentication.checkRole(["Supplier"]),
  validator.body(createCustomerDiscountCodeSchema),
  customerDiscountCode.createCustomerDiscountCode
);

export default router;
