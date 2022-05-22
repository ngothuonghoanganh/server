import * as express from "express";
import { database } from "../models/firebase/firebase";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";
import notification from "../services/realtime/notification";
// khởi tạo validator
const validator = createValidator();
//lấy schema từ validation trong services
import { querySchema } from "../services/validation/index";
import Payment from "../controllers/payment";
import transaction from "../controllers/transaction";
import { createClient } from "redis";

const router = express.Router();

router.get(
  "/",
  authentication.protected,
  async (req: any, res: any, next) => {
    try {
      const paymentlink = transaction.createPaymentLink({
        bankcode: "NCB",
        orderDescription: "test",
        ordertype: "total income",
        amount: 1000000,
        language: "",
        transactionId: "849adec7-2527-4391-b38d-caca7caf027f",
        vnp_ReturnUrl: process.env.vnp_ReturnUrl,
        vnp_HashSecret: process.env.vnp_HashSecret,
        vnp_Url: process.env.vnp_Url,
        vnp_TmnCode: process.env.vnp_TmnCode
      });
      return res.redirect(paymentlink)
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  }
);

router.post("/", Payment.createPayment);

export default router;
