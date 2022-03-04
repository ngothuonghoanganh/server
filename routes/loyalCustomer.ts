import * as express from "express";
import authentication from "../controllers/authentication";
import loyalCustomerController from "../controllers/loyalCustomer";

const router = express.Router();

router.post("/", authentication.protected, loyalCustomerController.create);
router.get("/", authentication.protected, loyalCustomerController.getAll);

router.put(
  "/:loyalCustomerConditionId",
  authentication.protected,
  loyalCustomerController.update
);

router.delete(
  "/:loyalCustomerConditionId",
  authentication.protected,
  loyalCustomerController.delete
);

router.get(
  "/:loyalCustomerConditionId",
  authentication.protected,
  loyalCustomerController.getOne
);
export default router;
