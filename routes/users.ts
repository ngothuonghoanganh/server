import * as express from "express";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";

// khởi tạo validator
const validator = createValidator();

import Authentication from "../controllers/authentication";
import User from "../controllers/user";
import {
  bodyLoginSchema,
  bodyRegisterSchema,
} from "../services/validation/authentication";

import {getCustomerOrSupplierByPhoneParamsSchema, getCustomerParamsSchema, getGetCustomerInfBodySchema, getListSupplierIdByListAccountIdBodySchema, getSupplierParamsSchema, resetPasswordForCustomerBodySchema, updateCustomerAccSchema } from "../services/validation/user";
// import { UserController } from "../controllers/user";
// import { bodyLoginSchema } from "../services/validation/authentication";

const router = express.Router();

// authentication
router.post("/login", validator.body(bodyLoginSchema), Authentication.login);

router.post("/login/google", Authentication.loginWithGoogle);

router.post(
  "/register",
  validator.body(bodyRegisterSchema),
  Authentication.createUser
);

router.post("/logout", Authentication.protected, Authentication.logout);

// // user infomation

router.get("/profile/me", Authentication.protected, User.getMe);

router.get(
  "/supplier",
  Authentication.protected,
  Authentication.checkRole(["Customer", "Inspector"]),
  User.listSupplier
);

router.put(
  "/customer",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  validator.body(updateCustomerAccSchema),
  User.updateCustomerAccountByCustomerId

)

router.post(
  '/getListAccountIdBySupplierId',
  validator.body(getListSupplierIdByListAccountIdBodySchema),
  User.getListSupplierIdByListAccountId
)

router.post(
  '/user/resetPassword',
  // Authentication.protected,
  // Authentication.checkRole(["Customer"]),
  validator.body(resetPasswordForCustomerBodySchema),
  User.resetPassword

)

router.get(
  '/noti',
  Authentication.protected,
  // Authentication.checkRole(["Customer"]),
  User.getNotiByUserId

)

router.get(
  "/supplier/:supplierId",
  // Authentication.protected,
  // Authentication.checkRole(["Customer", "Inspector"]),
  validator.params(getSupplierParamsSchema),
  User.getOneSupplier
);

// do not use
router.put(
  "/supplier/:supplierId",
  authentication.protected,
  User.updateSupplierAccount
);

router.delete(
  '/supplier/:supplierId',
  Authentication.protected,
  Authentication.checkRole(["Inspector"]),
  validator.params(getSupplierParamsSchema),
  User.deactivateSupplierAccount
)

router.get(
  "/customer",
  authentication.protected,
  Authentication.checkRole(["Customer", "Inspector", "Supplier"]),
  User.getAllCustomer
);

// router.delete(
//   '/:customerId',
//   authentication.protected,
//   Authentication.checkRole(["Supplier", "Customer"]),
//   validator.params(getCustomerParamsSchema),
//   User.deactivateCustomerAccount

// )

router.get("/:phone",
  validator.params(getCustomerOrSupplierByPhoneParamsSchema),
  User.getUserByPhone);

router.post(
  '/getCustomerInforByCustomerId',
  validator.body(getGetCustomerInfBodySchema),
  User.getCustomerInforByListCustomerId
)



export default router;
