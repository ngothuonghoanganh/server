import * as express from 'express';
import { AuthenticationController } from '../controllers/authentication';
import { CateController } from '../controllers/category';

const router = express.Router();

router.post(
    '/',
    AuthenticationController.protected,
    AuthenticationController.checkRole(["Supplier"]),
    CateController.createNewCate

)
export default router