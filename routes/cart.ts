import * as express from "express";
import Authentication from "../controllers/authentication";
// import { ShoppingCartController } from '../controllers/cart';
import { createValidator } from "express-joi-validation";
import cart from "../controllers/cart";
import {
  createAndUpdateBodyCartSchema,
  paramCartSchema,
} from "../services/validation/cart";
import { updateParamSchema } from "../services/validation/category";

const router = express.Router();
const validator = createValidator();

router.post(
  "/",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  // validator.body(createAndUpdateBodyCartSchema),
  cart.addToCart
);

router.put(
  "/:cartId",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  // validator.body(createAndUpdateBodyCartSchema),
  // validator.params(paramCartSchema),
  cart.updateCart
);

router.delete(
  "/:cartId",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  // validator.params(paramCartSchema),
  cart.deleteCart
);

router.get(
  "/",
  Authentication.protected,
  Authentication.checkRole(["Customer"]),
  cart.getCartByUserId
);
export default router;
