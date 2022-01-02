import * as express from 'express'
import Authentication from "../controllers/authentication";
import { ShoppingCartController } from '../controllers/cart';

const router= express.Router();

router.post(
    '/:productid',
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    ShoppingCartController.addToCart
)

router.put(
    '/:cartId',
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    ShoppingCartController.updateCart
)

router.delete(
    '/:cartId',
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    ShoppingCartController.deleteCart
)

router.get(
    '/',
    Authentication.protected,
    Authentication.checkRole(["Customer"]),
    ShoppingCartController.getCartByUserId
)
export default router


