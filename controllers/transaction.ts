import {
  Transaction
} from "../models/transaction";
import QueryString from "qs";
import crypto from "crypto";
import moment from "moment";
import dbEntity from "../services/dbEntity";

class TransactionController {
  public createTransaction = async (transaction: Transaction) => {
    try {
      const newTransaction = await Transaction
        .query()
        .insert({
          ...transaction
        });
      if (transaction.type === "penalty") {
        const paymentlink = this.createPaymentLink({
          bankcode: "NCB",
          orderDescription: transaction.description,
          ordertype: transaction.type,
          amount: transaction.penaltyFee,
          language: "",
          transactionId: transaction.id,
          vnp_ReturnUrl: process.env.vnp_ReturnUrl,
          vnp_HashSecret: process.env.vnp_HashSecret,
          vnp_Url: process.env.vnp_Url,
          vnp_TmnCode: process.env.vnp_TmnCode
        });
        await Transaction
          .query()
          .update({
            paymentLink: paymentlink
          })
          .where("id", newTransaction.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  public update = async (transaction: Transaction) => {
    try {
      const updateTransaction = await Transaction
        .query()
        .update({
          ...transaction
        })
        .where("supplierId", transaction.supplierId)
        .andWhere("type", transaction.type)
        .andWhere("status", transaction.status);

      console.log(transaction);
    } catch (error) {
      console.log(error);
    }
  };

  public createPaymentLink = ({
    bankcode,
    orderDescription,
    ordertype,
    amount,
    language,
    transactionId,
    vnp_ReturnUrl,
    vnp_HashSecret,
    vnp_Url,
    vnp_TmnCode
  }: any) => {
    try {
      const ipAddr = "13.215.133.39";

      const tmnCode = vnp_TmnCode
      const secretKey: any = vnp_HashSecret
      let vnpUrl = vnp_Url;
      const returnUrl = vnp_ReturnUrl;
      const bankCode = bankcode;

      const orderInfo = orderDescription;
      const orderType = ordertype;
      let date = new Date();
      let locale = language;
      if (locale === null || locale === "" || !locale) {
        locale = "vn";
      }

      let currCode = "VND";
      let vnp_Params: any = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: moment(date).format("HHmmss"),
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_ReturnUrl: returnUrl + `/transaction/payment?transactionId=${transactionId}`,
        vnp_Amount: amount * 100,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: moment(date).format("yyyyMMDDHHmmss")
      };
      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = this.sortObject(vnp_Params);
      const signData = QueryString.stringify(vnp_Params, {
        encode: false
      });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac
        .update(new Buffer(signData, "utf-8"))
        .digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + QueryString.stringify(vnp_Params, {
        encode: false
      });

      return vnpUrl;
    } catch (error) {
      console.log(error);
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
      const [account,
        income,
        penalty,
        transactionHistory
      ] = await Promise.all([
        Transaction
          .query()
          .select(...dbEntity.transactionEntity)
          .where("supplierId", req.user.id)
          .andWhere("type", "totalIncome")
          .andWhere("isWithdrawable", true)
          .first(),
        Transaction
          .query()
          .select(...dbEntity.transactionEntity)
          .where("supplierId", req.user.id)
          .andWhere("type", "transactionHistory"),
        Transaction
          .query()
          .select(...dbEntity.transactionEntity)
          .where("supplierId", req.user.id)
          .andWhere("type", "penalty"),
        Transaction
          .query()
          .select(...dbEntity.transactionEntity)
          .where("supplierId", req.user.id)
          .andWhere("type", "orderTransaction")
      ]);

      return res
        .status(200)
        .send({
          message: "successful",
          data: {
            account,
            income,
            penalty,
            transactionHistory
          }
        });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .send({
          message: error
        });
    }
  };

  public processTransaction = async (req: any, res: any) => {
    try {
      const transactions = await Transaction
        .query()
        .select(...dbEntity.transactionEntity, "suppliers.name")
        .join("suppliers", "suppliers.id", "transaction.supplierId")
        // .where("transaction.type", "")
        .where("transaction.status", "waiting");
      return res.render("transaction", {
        body: "hello",
        transactions
      });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .send({
          message: error
        });
    }
  };

  public createWithdrawableRequest = async (req: any, res: any) => {
    try {
      const {
        ewalletsecret,
        ewalletcode,
      } = req.user;

      const {
        transactionId,
        amount,
        bankCode,
        orderDescription,
        orderType
      } = req.body;

      const paymentLink = this.createPaymentLink({
        bankcode: bankCode,
        orderDescription: orderDescription,
        ordertype: orderType,
        amount: amount,
        language: "",
        transactionId: transactionId,
        vnp_ReturnUrl: process.env.vnp_ReturnUrl,
        vnp_HashSecret: ewalletsecret,
        vnp_Url: process.env.vnp_Url,
        vnp_TmnCode: ewalletcode
      });

      const transaction = await Transaction.query().select().where("id", transactionId).first()

      if (transaction.type === 'orderTransaction') {
        // delete transaction.id
        await Promise.all([
          Transaction.query().insert({
            supplierId: transaction.supplierId,
            advanceFee: transaction.advanceFee,
            platformFee: transaction.paymentFee,
            orderValue: transaction.orderValue,
            paymentFee: transaction.paymentFee,
            penaltyFee: transaction.penaltyFee,
            orderCode: transaction.orderCode,
            isWithdrawable: false,
            status: "active",
            type: "orderTransaction",
          }),
          Transaction.query()
            .update({
              isWithdrawable: false,
              status: "waiting",
              paymentLink: paymentLink,
              type: "transactionHistory"
            })
            .where("id", transactionId),
          Transaction.query().update({
            advanceFee: Transaction.raw(`"advanceFee" + ${transaction.advanceFee || 0}`),
            platformFee: Transaction.raw(
              `"platformFee" - ${transaction.platformFee}`
            ),
            paymentFee: Transaction.raw(
              `"paymentFee" - ${transaction.paymentFee}`
            ),
            orderValue: Transaction.raw(
              `"orderValue" - ${transaction.orderValue}`
            ),
          })
            .where("type", "totalIncome")
            .where("supplierId", transaction.supplierId)
        ])
      } else {
        await Promise.all([
          Transaction.query()
            .update({
              isWithdrawable: false,
              status: "waiting",
              paymentLink: paymentLink,
              type: "transactionHistory"
            })
            .where("id", transactionId),
          Transaction.query()
            .update({
              isWithdrawable: false
            })
            .where("type", "orderTransaction")
        ])
      }
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .send({
          message: error
        });
    }
  }

  confirmTransactionRequest = async (req: any, res: any) => {
    try {
      const { transactionId } = req.query

      await Transaction.query().update({
        status: "done",
        isWithdrawable: false
      }).where("id", transactionId)

      const transaction = await Transaction.query().select().where("id", transactionId).first()

      if (transaction.type === "penalty") {
        return res.status(200).send("successful")
      } else return res.redirect("/process-transaction")
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .send({
          message: error
        });
    }
  }
}

export default new TransactionController();