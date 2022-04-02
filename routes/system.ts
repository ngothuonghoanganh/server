import * as express from "express";
import { createValidator } from "express-joi-validation";
import systemControllers from "../controllers/system";
const router = express.Router();

const validator = createValidator();

router.get("/orders", systemControllers.getAllOrders);

router.get("/campaigns", systemControllers.getAllCampaigns);

router.get("/suppliers", systemControllers.getAllSupplier);

router.get("/customers", systemControllers.getAllCustomer);

export default router;