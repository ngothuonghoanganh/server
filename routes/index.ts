import * as express from "express";
import { AuthenticationController } from "../controllers/authentication";
import { Role } from "../models/role";

const router = express.Router();

router.get(
  "/",
  AuthenticationController.protected,
  AuthenticationController.checkRole(["Customer","Supplier"]),
  async (req: any, res: any, next) => {
    try {
      const role = await Role.query().select();
      return res.status(200).send(role);
    } catch (error) {
      console.log(error);
    }
  }
);
export default router;
