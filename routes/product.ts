import * as express from 'express'
import { ProductController } from '../controllers/product'
import { AuthenticationController } from '../controllers/authentication'

const router=express.Router();

router.get(
    '/',
    // AuthenticationController.protected,
    // AuthenticationController.checkRole(["Supplier"]),
    ProductController.getAllProduct
)

router.put(
    '/:productId',
    AuthenticationController.protected,
    AuthenticationController.checkRole(["Supplier"]),
    ProductController.updateProduct
)

router.post(
    '/:categoryId',
    AuthenticationController.protected,
    AuthenticationController.checkRole(["Supplier"]),
    ProductController.createNewProduct
)



export default router