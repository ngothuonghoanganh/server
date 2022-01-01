import * as express from "express";
import { createValidator } from "express-joi-validation";

// khởi tạo validator
const validator = createValidator();

import Authentication from "../controllers/authentication";
import {
  bodyLoginSchema,
  bodyRegisterSchema,
} from "../services/validation/authentication";
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

// router.get(
//   "/profile/me",
//   AuthenticationController.protected,
//   AuthenticationController.getMe
// );

// router.get("/", AuthenticationController.protected, UserController.listUser);

// router.put(
//   "/:userId",
//   AuthenticationController.protected,
//   UserController.updateUser
// );

// router.delete(
//   "/:userId",
//   AuthenticationController.protected,
//   UserController.deleteUser
// );

// router.get("/:phone", UserController.getUserByPhone);

export default router;
