import * as express from 'express'
import Authentication from "../controllers/authentication";
import { createValidator } from "express-joi-validation";
import address from "../controllers/address";
import { createNewAddressSchema } from '../services/validation/address';

const validator = createValidator();
const router = express.Router();

router.post(
    "/",
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    validator.body(createNewAddressSchema),
    address.createAddress
  );


  router.get(
    "/default",
    Authentication.protected,
    // Authentication.checkRole(["Customer"]),
    address.getAllAdressDefault
  );

  router.get(
    "/All",
    Authentication.protected,
    // Authentication.checkRole(["Customer"]),
    address.getAllAdress
  );

  router.put(
    "/:addressId",
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    address.updateAdress
  );

  router.delete(
    "/:addressId",
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    address.deleteAdress
  );

export default router;
