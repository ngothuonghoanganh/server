import * as express from "express";
import { createValidator } from "express-joi-validation";
import Authentication from "../controllers/authentication";
import Transaction from "../controllers/transaction";
const router = express.Router();

const validator = createValidator();

router.post(
  "/createWithdrawableRequest",
  Authentication.protected,
  Transaction.createWithdrawableRequest
);
router.get("/", Authentication.protected, Transaction.getTransaction);
router.get(
  "/payment",
  Transaction.confirmTransactionRequest
);

export default router;
