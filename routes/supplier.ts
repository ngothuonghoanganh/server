import * as express from "express";
import { createValidator } from "express-joi-validation";
import Authentication from "../controllers/authentication";
import supplier from "../controllers/supplier";
import { bodyUpdateEwalletSchema, checkExistEmailQuerySchema } from "../services/validation/supplier";


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
    '/existEmail',
    validator.query(checkExistEmailQuerySchema),
    supplier.checkExistedEmail
  )

export default router;


