import console from "console";
import { CustomerDiscountCode } from "../models/customerdiscountcode";
import { DiscountCode } from "../models/discountcode";

class CustomerDiscountCodeController {
  public createCustomerDiscountCode = async (req: any, res: any, next: any) => {
    try {
      let { discountCodeId, quantity, status = "ready", customerId } = req.body;

      let createCode = await CustomerDiscountCode.query().insert({
        discountCodeId: discountCodeId,
        quantity: quantity,
        status: status,
        customerId: customerId,
      });

      return res.status(200).send({
        message: "successful",
        data: createCode,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getListDiscountCodeByStatus = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const status = req.query.status;
      const customerId = req.user.id;

      const ListEntity = [
        "customerDiscountCodes.customerId as customerId",
        "customerDiscountCodes.id as id",
        "customerDiscountCodes.disCountcodeId as discountCodeId",
        "customerDiscountCodes.status as customerDiscountCodeStatus",
      ];

      const discountCodeEntit = [
        "discountCodes.supplierId as supplierId",
        "discountCodes.code as code",
        "discountCodes.description as description",
        "discountCodes.minimunpricecondition as minimunPriceCondition",
        "discountCodes.startdate as startdate",
        "discountCodes.enddate as enddate",
        "discountCodes.quantity as quantity",
        "discountCodes.createdat as createdAt",
        "discountCodes.updatedat as updatedAt",
        "discountCodes.status as status",
        "discountCodes.productid as productId",
        "discountCodes.discountprice as discountPrice",
      ];

      const listDiscountCode: any = await CustomerDiscountCode.query()
        .select(discountCodeEntit, ListEntity)
        .join(
          "discountCodes",
          "discountCodes.id",
          "customerDiscountCodes.discountcodeid"
        )
        .where("customerDiscountCodes.status", status)
        .andWhere("customerid", customerId);

      return res.status(200).send({
        message: "successful",
        data: listDiscountCode,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public reduceDiscountUse = async (req: any, res: any, next: any) => {
    try {
      const status = "used";
      const customerDiscountCodeId = req.body.customerDiscountCodeId;

      const updateStatusForCusDiscountCode: any =
        await CustomerDiscountCode.query()
          .update({
            status: status,
          })
          .where("id", customerDiscountCodeId)
          .andWhere("status", "ready");

      if (updateStatusForCusDiscountCode === 0) {
        return res.status(200).send("discount code is used");
      }

      const currentDiscountCodeId: any = await CustomerDiscountCode.query()
        .select("disCountcodeId")
        .where("id", customerDiscountCodeId)
        .first();

      const currentQuantityOfDiscountCode: any = await DiscountCode.query()
        .select("quantity")
        .where("id", currentDiscountCodeId["discountcodeid"])
        .first();

      const updateQuantity: any = await DiscountCode.query()
        .update({
          quantity: currentQuantityOfDiscountCode["quantity"] - 1,
        })
        .where("id", currentDiscountCodeId["discountcodeid"]);

      return res.status(200).send({
        message: "successful",
        data: updateQuantity,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getListCustomerDiscountCodeBySuppId = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const suppId = req.body.suppId;
      const customerId = req.user.id;
      const status = "ready";
      const minPriceCondition = req.body.minPriceCondition;
      const productIds = req.body.productIds;

      const ListEntity = [
        "customerDiscountCodes.id as id",
        "customerDiscountCodes.customerId as customerId",
        "customerDiscountCodes.discountCodeId as discountCodeId",
        "customerDiscountCodes.status as customerDiscountCodeStatus",
      ];

      const discountCodeEntity = [
        "discountCodes.supplierId as supplierId",
        "discountCodes.code as code",
        "discountCodes.description as description",
        "discountCodes.minimunPriceCondition as minimunPriceCondition",
        "discountCodes.startDate as startdate",
        "discountCodes.endDate as enddate",
        "discountCodes.quantity as quantity",
        "discountCodes.createdAt as createdAt",
        "discountCodes.updatedAt as updatedAt",
        "discountCodes.status as status",
        "discountCodes.productId as productId",
        "discountCodes.discountPrice as discountPrice",
      ];

      const ListCusDiscountCode = productIds
        ? await CustomerDiscountCode.query()

            .select(discountCodeEntity, ...ListEntity)
            .join(
              "discountCodes",
              "discountCodes.id",
              "customerDiscountCodes.discountCodeId"
            )
            .whereIn("discountCodes.productId", productIds)
            .where("discountCodes.supplierId", suppId)
            .andWhere("customerDiscountCodes.status", status)
            .andWhere("customerId", customerId)
        : await CustomerDiscountCode.query()

            .select(discountCodeEntity, ...ListEntity)
            .join(
              "discountCodes",
              "discountCodes.id",
              "customerDiscountCodes.discountCodeId"
            )
            .where("discountCodes.supplierId", suppId)
            .andWhere(
              "discountCodes.minimunPriceCondition",
              "<=",
              minPriceCondition
            )
            .andWhere("customerDiscountCodes.status", status)
            .andWhere("customerId", customerId);

      console.log(ListCusDiscountCode);
      return res.status(200).send({
        message: "successful",
        data: ListCusDiscountCode,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getCustomerDiscountByDiscountCodeAndSuppId = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const status = "ready";
      const discountCode = req.body.discountCode;
      const supplierId = req.body.supplierId;
      const customerId = req.user.id;
      const ListEntity = [
        "customerDiscountCodes.id as id",
        "customerDiscountCodes.customerId as customerId",
        "customerDiscountCodes.discountCodeId as discountCodeId",
        "customerDiscountCodes.status as customerDiscountCodeStatus",
      ];

      const discountCodeEntity = [
        "discountCodes.supplierId as supplierId",
        "discountCodes.code as code",
        "discountCodes.description as description",
        "discountCodes.minimunPriceCondition as minimunPriceCondition",
        "discountCodes.startDate as startdate",
        "discountCodes.endDate as enddate",
        "discountCodes.quantity as quantity",
        "discountCodes.createdAt as createdAt",
        "discountCodes.updatedAt as updatedAt",
        "discountCodes.status as status",
        "discountCodes.productId as productId",
        "discountCodes.discountPrice as discountPrice",
      ];

      const data = await CustomerDiscountCode.query()
        .select(...ListEntity, ...discountCodeEntity)
        .join(
          "discountCodes",
          "discountCodes.id",
          "customerDiscountCodes.discountCodeId"
        )
        .where("customerDiscountCodes.status", status)
        .andWhere("discountCodes.code", discountCode)
        .andWhere("discountCodes.supplierid", supplierId)
        .andWhere("customerDiscountCodes.customerid", customerId);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new CustomerDiscountCodeController();
