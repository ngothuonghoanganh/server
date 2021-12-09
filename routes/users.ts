import * as express from "express";
import { AuthenticationController } from "../controllers/authentication";
import { UserController } from "../controllers/user";

const router = express.Router();

router.post("/login", AuthenticationController.login);

router.post("/loginWithGoogle", AuthenticationController.loginWithGoogle);

router.post("/register", AuthenticationController.createUser);

router.post(
  "/logout",
  AuthenticationController.protected,
  AuthenticationController.logout
);

router.get(
  "/profile/me",
  AuthenticationController.protected,
  AuthenticationController.getMe
);

router.get("/", AuthenticationController.protected, UserController.listUser);

router.put(
  "/:userId",
  AuthenticationController.protected,
  UserController.updateUser
);

router.delete(
  "/:userId",
  AuthenticationController.protected,
  UserController.deleteUser

);



export default router;
