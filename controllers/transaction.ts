import { Transaction } from "../models/transaction";
import QueryString from "qs";
import crypto from "crypto";
import moment from "moment";
import dbEntity from "../services/dbEntity";

class TransactionController {
  public createTransaction = async (transaction: Transaction) => {
    try {
      const newTransaction = await Transaction.query().insert({
        ...transaction,
      });
      if (transaction.type === "penalty") {
        const paymentlink = this.createPaymentLink(
          "NCB",
          transaction.description,
          transaction.type,
          transaction.penaltyFee,
          "",
          transaction.id
        );
        await Transaction.query()
          .update({
            paymentLink: paymentlink,
          })
          .where("id", newTransaction.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  public createPaymentLink = (
    bankcode: any,
    orderDescription: any,
    ordertype: any,
    amount: any,
    language: any,
    penaltyId: any
  ) => {
    try {
      const ipAddr = "13.215.133.39";

      const tmnCode = process.env.vnp_TmnCode;
      const secretKey: any = process.env.vnp_HashSecret;
      let vnpUrl = process.env.vnp_Url;
      const returnUrl = process.env.vnp_ReturnUrl;

      // const amount = req.body.amount;
      const bankCode = bankcode;

      const orderInfo = orderDescription;
      const orderType = ordertype;
      let date = new Date();
      let locale = language;
      if (locale === null || locale === "" || !locale) {
        locale = "vn";
      }

      console.log(moment(date).format("yyyyMMDDHHmmss"));
      let currCode = "VND";
      let vnp_Params: any = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      // vnp_Params['vnp_Merchant'] = ''
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = moment(date).format("HHmmss");
      vnp_Params["vnp_OrderInfo"] = orderInfo;
      vnp_Params["vnp_OrderType"] = orderType;
      vnp_Params["vnp_ReturnUrl"] =
        returnUrl + `/transaction/payment?penaltyId=${penaltyId}&type=penalty`;
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = moment(date).format("yyyyMMDDHHmmss");
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      console.log(vnp_Params["vnp_TxnRef"]);
      vnp_Params = this.sortObject(vnp_Params);
      const signData = QueryString.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + QueryString.stringify(vnp_Params, { encode: false });

      return vnpUrl;
    } catch (error) {
      console.log(error);
    }
  };

  public update = async (transaction: Transaction) => {
    try {
      const updateTransaction = await Transaction.query()
        .update({
          ...transaction,
        })
        .where("supplierId", transaction.supplierId)
        .andWhere("type", transaction.type)
        .andWhere("status", transaction.status);

      console.log(transaction);
    } catch (error) {
      console.log(error);
    }
  };

  public createWithdrawableRequest = async (req: any, res: any, next: any) => {
    try {
      const { ewalletsecrect, ewalletcode, id } = req.user;
      const { ordercode } = req.body;

      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      const tmnCode = ewalletcode;
      const secretKey: any = ewalletsecrect;
      let vnpUrl = process.env.vnp_Url;
      const returnUrl = process.env.vnp_ReturnUrl;

      const amount = req.body.amount * 100;
      if (req.body.amount < 10000) {
        return res.status(200).send({
          message: "can not withdraw with amount under 10,000 VND",
        });
      }
      const bankCode = req.body.bankCode;

      const orderInfo = req.body.orderDescription;
      const orderType = req.body.orderType;
      let date = new Date();
      let locale = req.body.language;
      if (locale === null || locale === "" || !locale) {
        locale = "vn";
      }

      // const order = await Order.query().select().where("id", orderId).first();

      let currCode = "VND";
      let vnp_Params: any = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      // vnp_Params['vnp_Merchant'] = ''
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = moment(date).format("HHmmss");
      vnp_Params["vnp_OrderInfo"] = orderInfo;
      vnp_Params["vnp_OrderType"] = orderType;
      vnp_Params["vnp_ReturnUrl"] =
        returnUrl + `/transaction/payment?supplierId=${id}&type=income`;
      vnp_Params["vnp_Amount"] = amount;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = moment(date).format("yyyyMMDDHHmmss");
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = this.sortObject(vnp_Params);
      const signData = QueryString.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + QueryString.stringify(vnp_Params, { encode: false });
      await Transaction.query()
        .update({
          isWithdrawable: false,
          status: "waiting",
          paymentLink: vnpUrl,
        })
        .where("ordercode", ordercode)
        .andWhere("type", "income");

      return res.status(200).send({
        data: vnpUrl,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  sortObject(obj: any) {
    let sorted: any = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  public getTransaction = async (req: any, res: any) => {
    try {
      const [income, penalty] = await Promise.all([
        Transaction.query()
          .select(...dbEntity.transactionEntity)
          .where("supplierId", req.user.id)
          .andWhere("type", "income"),
        Transaction.query()
          .select(...dbEntity.transactionEntity)
          .where("supplierId", req.user.id)
          .andWhere("type", "penalty"),
      ]);

      return res.status(200).send({
        message: "successful",
        data: {
          income,
          penalty,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public confirmTransactionRequest = async (req: any, res: any) => {
    try {
      const { ordercode, type, penaltyId, supplierId } = req.query;

      let transaction = 0;
      if (type === "income") {
        transaction = await Transaction.query()
          .update({
            isWithdrawable: false,
            status: "done",
            description: "This transaction has been completed",
          })
          .where("supplierId", supplierId)
          .andWhere("type", type);
        return res.redirect("/process-transaction");
      } else {
        transaction = await Transaction.query()
          .update({
            isWithdrawable: false,
            status: "done",
          })
          .where("id", penaltyId)
          .andWhere("type", type);
      }
      return res.status(200).send({
        message: "success",
        data: transaction,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public processTransaction = async (req: any, res: any) => {
    try {
      const transactions = await Transaction.query()
        .select(...dbEntity.transactionEntity, "suppliers.name")
        .join("suppliers", "suppliers.id", "transaction.supplierId")
        .where("transaction.type", "income")
        .andWhere("transaction.status", "waiting");
      return res.render("transaction", {
        body: "hello",
        transactions,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };
}

export default new TransactionController();
