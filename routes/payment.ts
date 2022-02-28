import * as express from "express";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";
import notification from "../services/realtime/notification";
// khởi tạo validator
const validator = createValidator();
//lấy schema từ validation trong services
import Payment from "../controllers/payment";

const router = express.Router();

router.post("/", Payment.createPayment);
router.get("/", Payment.getPaymentDetails);


export default router;
