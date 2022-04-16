import * as express from "express";
import { createValidator } from "express-joi-validation";
import Authentication from "../controllers/authentication";
import Transaction from "../controllers/transaction";
const router = express.Router();

router.get("/process-transaction", Transaction.processTransaction);

export default router;
