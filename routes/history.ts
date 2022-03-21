import * as express from "express";
import { createValidator } from "express-joi-validation";

import Authentication from "../controllers/authentication";
import RetailHistory from "../controllers/history";
import { bodyOrderIdSchema, queryOrderHistoryIdSchema } from "../services/validation/orderhistory";

const router = express.Router();
const validator = createValidator();

router.get(
    '/',
    validator.query(queryOrderHistoryIdSchema),
    RetailHistory.getRetailHistoryById
)

router.post(
    '/orderId',
    validator.body(bodyOrderIdSchema),
    RetailHistory.getRetailHistoryByOrderId
)






export default router;

