import * as express from "express";
import { createValidator } from "express-joi-validation";
import Authentication from "../controllers/authentication";

import order from "../controllers/order";
import { createProductBodySchema } from "../services/validation/order";

const router = express.Router();

const validator = createValidator();

router.post(
    '/',
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    validator.body(createProductBodySchema),
    order.createOrder
)

export default router;
