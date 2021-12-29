import * as express from 'express'
import { AuthenticationController } from '../controllers/authentication';
import { ShoppingCartController } from '../controllers/cart';

const router= express.Router();

router.post(
    '/:productid',
    AuthenticationController.protected,
    AuthenticationController.checkRole(["Customer"]),
    ShoppingCartController.addToCart
)

router.put(
    '/:cartId',
    AuthenticationController.protected,
    AuthenticationController.checkRole(["Customer"]),
    ShoppingCartController.updateCart
)

router.delete(
    '/:cartId',
    AuthenticationController.protected,
    AuthenticationController.checkRole(["Customer"]),
    ShoppingCartController.deleteCart
)

router.get(
    '/',
    AuthenticationController.protected,
    AuthenticationController.checkRole(["Customer"]),
    ShoppingCartController.getCartByUserId
)
export default router


