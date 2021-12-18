import * as express from 'express'
import { ProductController } from '../controllers/product'
import { AuthenticationController } from '../controllers/authentication'
import { Products } from '../models/product';

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
    '/',
    AuthenticationController.protected,
    AuthenticationController.checkRole(["Supplier"]),
    ProductController.createNewProduct
)

router.get(
    '/All',
    ProductController.getAllProductsAndCates
)



export default router