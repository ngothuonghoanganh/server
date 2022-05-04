import * as express from "express";
import { createValidator } from "express-joi-validation";
import Authentication from "../controllers/authentication";

import order from "../controllers/order";
import {
  getByOrderCodeQuerySchema,
  getOrderByIdSchema,
  updateStatusFromDeliveringToCancelledForDelivery,
  updateStatusFromReturningToDeliveredForRejectReturn,
  validDeliveredToCompletedSchema,
  validDeliveredToReturningSchema,
  validDeliveringToDeliveredSchema,
  validProcessingToDeliveringSchema,
  validReturningToReturnedSchema,
  validStatusForCreatedToProcessingForSupplierSchema,
  validUpdateStatusToCancelCustomerBodySchema,
  validUpdateStatusToCancelSupplierBodySchema,
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
  "/status/customer/completed",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  validator.body(validDeliveredToCompletedSchema),
  order.updateStatusFromDeliveredToCompletedForCustomer
);

router.put(
  "/status/customer/returning",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  validator.body(validDeliveredToReturningSchema),
  order.updateStatusFromDeliveredToReturningForCustomer
);

router.put(
  "/status/supplier/returned",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.body(validReturningToReturnedSchema),
  order.updateStatusFromReturningToReturned
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
  "/supplier/status",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  order.getOrderForSupplierByStatus
);

router.get(
  "/supplier/campaign/:campaignId",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  order.getOrderForSupplierAllowCampaign
);

router.put(
  "/status/supplier/delivering",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.body(validProcessingToDeliveringSchema),
  order.updateStatusFromProcessingToDeliveringForSupplier
);

router.put(
  "/status/supplier/processing",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.body(validStatusForCreatedToProcessingForSupplierSchema),
  order.updateStatusFromCreatedToProcessingForSupplier
);

// router.put(
//   "/status/customer/cancel",
//   Authentication.protected,
//   Authentication.checkRole(["Customer"]),
//   validator.body(validUpdateStatusToCancelCustomerBodySchema),
//   order.updateStatusToCancelledForCustomer
// );

router.put(
  "/status/supplier/cancel",
  Authentication.protected,
  // Authentication.checkRole(["Supplier"]),
  validator.body(validUpdateStatusToCancelSupplierBodySchema),
  order.updateStatusToCancelledForSupplier
);

// router.put(
//   "/inspector",
//   Authentication.protected,
//   Authentication.checkRole(["Customer", "Supplier"]),
//   validator.body(validOrderForSuppAndInsCancelBodySchema),
//   order.updateStatusFromCreatedOrProcessingToCancelledForSupplier
// );

router.put(
  "/status/delivery/delivered",
  // Authentication.protected,
  // Authentication.checkRole(["Delivery"]),
  validator.body(validDeliveringToDeliveredSchema),
  order.updateStatusFromDeliveringToDeliveredForDelivery
);

router.put(
  "/status/delivery/cancelled",
  // Authentication.protected,
  // Authentication.checkRole(["Delivery"]),
  validator.body(updateStatusFromDeliveringToCancelledForDelivery),
  order.updateStatusFromDeliveringToCancelledForDelivery
);

router.put(
  "/status/supplier/delivered",
  Authentication.protected,
  Authentication.checkRole(["Supplier", "CustomerService"]),
  validator.body(updateStatusFromReturningToDeliveredForRejectReturn),
  order.updateStatusFromReturningToDeliveredForRejectReturn
);

// router.get(
//   "/customer/:orderId",
//   Authentication.protected,
//   // Authentication.checkRole(["Customer"]),
//   validator.params(getOrderByIdSchema),
//   order.getOrderById
// );

router.get(
  "/delivery/getListOrderForDelivery",
  // validator.params(getOrderForDeliveryQuerySchema),
  order.getListOrderForDelivery
);

router.get(
  '/getOrderByCode',
  validator.query(getByOrderCodeQuerySchema),
  order.getOrderByCode
)

export default router;
