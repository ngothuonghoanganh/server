import * as express from "express";
import { createValidator } from "express-joi-validation";
import Authentication from "../controllers/authentication";

import order from "../controllers/order";
import { changeStatusToCancelledSchema, changeStatusToProcessingSchema, createOrderBodySchema, validStatusForDeleveredSchema } from "../services/validation/order";

const router = express.Router();

const validator = createValidator();

router.post(
    '/',
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    // validator.body(createOrderBodySchema),
    order.createOrder
)

router.put(
    '/customer',
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    validator.body(changeStatusToCancelledSchema),
    order.updateStatusOfOrderToCancelledForCustomer
)


router.get(
    '/customer',
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    order.getOrderForCustomer
)

router.get(
    '/supplier',
    Authentication.protected,
    Authentication.checkRole(["Supplier"]),
    order.getOrderForSupplier
)

router.get(
    '/supplier/campaign/:campaignId',
    Authentication.protected,
    Authentication.checkRole(["Supplier"]),
    order.getOrderForSupplierAllowCampaign
)

router.put(
    '/customer/delivered',
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    validator.body(validStatusForDeleveredSchema),
    order.updateStatusOfOrderToCompletedOrReturnedForCustomer
)

router.put(
    '/',
    Authentication.protected,
    Authentication.checkRole(["Supplier", "Inspector"]),
    validator.body(changeStatusToCancelledSchema),
    order.updateStatusToCancelledForSupplierAndInspector
)

router.put(
    '/delivery',
    Authentication.protected,
    Authentication.checkRole(["Delivery"]),
    validator.body(validStatusForDeleveredSchema),
    order.updateStatusForDelivery
)


export default router;
