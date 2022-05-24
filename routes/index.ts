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
import { Transaction } from "../models/transaction";
import moment from "moment";

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

router.get("/statistical/supplier", authentication.protected, async (req: any, res: any, next) => {
  try {

    const supplierId = req.user.id
    const startDateInMonth = moment().startOf("M")
    const endDateInMonth = moment().endOf("M")

    const [orders, income, totalIncomeInThisMonth, totalOrderInThisMonth] = await Promise.all([Transaction.query().select(Transaction.raw(` 
    to_char(date_trunc('month', "createdAt"), 'YYYY') AS year,
    to_char(date_trunc('month', "createdAt"), 'Mon') AS month,
    to_char(date_trunc('month', "createdAt"), 'MM') AS "monthNumber",
    count(*) as totalOrders`))
      .where("type", "orderTransaction")
      .andWhere("supplierId", supplierId)
      .groupBy("year", "month", "monthNumber"),
    Transaction.query().select(Transaction.raw(` 
      to_char(date_trunc('month', "createdAt"), 'YYYY') AS year,
      to_char(date_trunc('month', "createdAt"), 'Mon') AS month,
      to_char(date_trunc('month', "createdAt"), 'MM') AS "monthNumber",
      sum(amount) as totalIncome`))
      .where("type", "orderTransaction")
      .andWhere("supplierId", supplierId)
      .groupBy("year", "month", "monthNumber"),
    Transaction.query()
      .select().sum("amount")
      .whereBetween("createdAt", [startDateInMonth, endDateInMonth])
      .andWhere("supplierId", supplierId)
      .andWhere("type", "orderTransaction")
      .first(),
    Transaction.query()
      .select().count("*")
      .whereBetween("createdAt", [startDateInMonth, endDateInMonth])
      .andWhere("supplierId", supplierId)
      .andWhere("type", "orderTransaction")
      .first()
    ])

    return res.status(200).send({
      orders,
      income,
      totalIncomeInThisMonth,
      totalOrderInThisMonth
    })
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: error });
  }
})

export default router;
