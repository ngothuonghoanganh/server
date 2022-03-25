import * as express from "express";
import { createValidator } from "express-joi-validation";
import Authentication from "../controllers/authentication";
import supplier from "../controllers/supplier";
import {
  bodyUpdateEwalletSchema,
  checkExistEmailQuerySchema,
  validSuppIdsBodySchema,
} from "../services/validation/supplier";

const router = express.Router();

const validator = createValidator();

router.post(
  "/update/ewallet",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.body(bodyUpdateEwalletSchema),
  supplier.updateWalletAccount
);

router.get(
  "/existEmail",
  validator.query(checkExistEmailQuerySchema),
  supplier.checkExistedEmail
);

router.put(
  "/profile",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  supplier.updateProfile
);

router.put(
  "/ewallet",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  supplier.updateWallet
);

router.put(
  "/identification",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  supplier.updateIdentification
);

router.post(
  "/getSuppInforByListSuppId",
  // Authentication.protected,
  // Authentication.checkRole(["Supplier"]),
  validator.body(validSuppIdsBodySchema),
  supplier.getSuppInforByListSuppId
);
export default router;
