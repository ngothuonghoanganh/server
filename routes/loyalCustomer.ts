import * as express from "express";
import authentication from "../controllers/authentication";
import loyalCustomerController from "../controllers/loyalCustomer";
import Authentication from "../controllers/authentication";
import { createValidator } from "express-joi-validation";


const router = express.Router();
const validator = createValidator();

router.post("/", authentication.protected, loyalCustomerController.create);
router.get("/", authentication.protected, loyalCustomerController.getAll);
router.get(
  "/customer",
  authentication.protected,
  loyalCustomerController.getAllCustoner
);

router.get(
  "/getLoyalCustomerByLoginCustomer",
  authentication.protected,
  Authentication.checkRole(["Customer"]),
  loyalCustomerController.getLoyalCustomerByLoginCustomer
);

router.post(
  '/list/loyalCustomer',
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  loyalCustomerController.getLoyaCustomerBySuppIdAndCusId
)

router.put(
  "/:loyalCustomerConditionId",
  authentication.protected,
  loyalCustomerController.update
);
router.put(
  "/customer/:loyalCustomerId",
  authentication.protected,
  loyalCustomerController.updateStatusLoyalCustomer
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
