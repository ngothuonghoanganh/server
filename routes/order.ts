import * as express from "express";
import { createValidator } from "express-joi-validation";
import Authentication from "../controllers/authentication";

import order from "../controllers/order";
import {
  changeStatusToCancelledSchema,
  changeStatusToProcessingSchema,
  createOrderBodySchema,
  getOrderByIdSchema,
  validOrderCodeSchema,
  validOrderForSuppAndInsCancelBodySchema,
  validStatusForCreatedOrAdvancedToProcessingForSupplierSchema,
  validStatusForDeleveredSchema,
} from "../services/validation/order";

const router = express.Router();

const validator = createValidator();

router.post(
  "/",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  // validator.body(createOrderBodySchema),
  order.createOrder
);

router.post("/payment", order.paymentOrder);

router.put(
  "/customer",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  validator.body(validOrderCodeSchema),
  order.updateStatusFromDeliveredToCompletedForCustomer
);

router.put(
  "/customer/returned",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  validator.body(validOrderCodeSchema),
  order.updateStatusFromDeliveredToReturnedForCustomer
);

router.get(
  "/customer",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  order.getOrderForCustomer
);

router.get(
  "/supplier",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  order.getOrderForSupplier
);

router.get(
  "/supplier/campaign/:campaignId",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  order.getOrderForSupplierAllowCampaign
);

router.put(
  "/supplier/delivering",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.body(validStatusForDeleveredSchema),
  order.updateStatusFromProcessingToDeliveringForSupplier
);

router.put(
  "/supplier",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.body(validStatusForCreatedOrAdvancedToProcessingForSupplierSchema),
  order.updateStatusFromCreatedToProcessingForSupplier
);

router.put(
  "/supplier/cancel",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.body(validOrderForSuppAndInsCancelBodySchema),
  order.updateStatusFromCreatedOrProcessingToCancelledForInspectorAndSupplier
);

router.put(
  "/inspector",
  Authentication.protected,
  Authentication.checkRole(["Inspector"]),
  validator.body(validOrderForSuppAndInsCancelBodySchema),
  order.updateStatusFromCreatedOrProcessingToCancelledForInspectorAndSupplier
);

router.put(
  "/delivery/delivered",
  Authentication.protected,
  Authentication.checkRole(["Delivery"]),
  validator.body(validOrderCodeSchema),
  order.updateStatusFromDeliveringToDeliveredForDelivery
);

router.get(
  "/customer/:orderId",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  validator.params(getOrderByIdSchema),
  order.getOrderById
);

export default router;
