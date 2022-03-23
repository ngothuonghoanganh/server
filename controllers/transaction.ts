import { Transaction } from "../models/transaction";
import dateFormat from "dateformat";
import QueryString from "qs";
import crypto from "crypto";

class TransactionController {
  public createTransaction = async (transaction: Transaction) => {
    try {
      await Transaction.query().insert({
        ...transaction,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public update = async (transaction: Transaction) => {
    try {
      await Transaction.query()
        .update({
          ...transaction,
        })
        .where("ordercode", transaction.ordercode)
        .andWhere("type", transaction.type);
    } catch (error) {
      console.log(error);
    }
  };

  public createWithdrawableRequest = async (req: any, res: any, next: any) => {
    try {
      const { ewalletsecrect, ewalletcode, id } = req.user;
      const { ordercodes } = req.body;

      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      const tmnCode = ewalletcode;
      const secretKey: any = ewalletsecrect;
      let vnpUrl = process.env.vnp_Url;
      const returnUrl = process.env.vnp_ReturnUrl;

      const amount = req.body.amount;
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
      vnp_Params["vnp_TxnRef"] = dateFormat(date, "HHmmss");
      vnp_Params["vnp_OrderInfo"] = orderInfo;
      vnp_Params["vnp_OrderType"] = orderType;
      vnp_Params["vnp_ReturnUrl"] =
        returnUrl +
        `/transaction/payment?ordercode=${JSON.stringify(ordercodes)}`;
      vnp_Params["vnp_Amount"] = amount;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = dateFormat(date, "yyyymmddHHmmss");
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

      await Transaction.query()
        .update({
          iswithdrawable: false,
          status: "waiting",
        })
        .whereIn("ordercode", ordercodes)
        .where("type", "income");
      return res.status(200).send({
        data: vnpUrl,
      });
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
}

export default new TransactionController();
