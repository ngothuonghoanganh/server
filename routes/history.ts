import * as express from "express";
import { createValidator } from "express-joi-validation";

import OrderStatusHistory from "../controllers/orderStatusHistoryController";
import { bodyOrderCodeSchema,queryOrderHistoryIdSchema } from "../services/validation/orderhistory";

const router = express.Router();
const validator = createValidator();

router.get(
    '/',
    validator.query(queryOrderHistoryIdSchema),
    OrderStatusHistory.getRetailHistoryById
)

router.post(
    '/orderCode',
    validator.body(bodyOrderCodeSchema),
    OrderStatusHistory.getRetailHistoryByOrderId
)

router.post(
    '/test',
    OrderStatusHistory.test
)





export default router;

