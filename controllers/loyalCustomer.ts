import { LoyalCustomer } from "../models/loyalCustomer";
import { LoyalCustomerCondition } from "../models/loyalCustomerCondition";
import { Suppliers } from "../models/suppliers";

class LoyalcustomerController {
  public create = async (req: any, res: any, next: any) => {
    try {
      const { minOrder, minProduct, discountPercent } = req.body;
      const supplierId = req.user.id;

      const newConditon = await LoyalCustomerCondition.query().insert({
        supplierId: supplierId,
        minOrder: minOrder,
        minProduct: minProduct,
        discountPercent: discountPercent,
      });

      return res.status(200).send({
        data: newConditon,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public update = async (req: any, res: any, next: any) => {
    try {
      const { minOrder, minProduct, discountPercent } = req.body;
      const id = req.params.loyalCustomerConditionId;

      const newConditon = await LoyalCustomerCondition.query()
        .update({
          minOrder: minOrder,
          minProduct: minProduct,
          discountPercent: discountPercent,
        })
        .where("id", id);

      return res.status(200).send({
        data: newConditon,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public delete = async (req: any, res: any, next: any) => {
    try {
      const id = req.params.loyalCustomerConditionId;

      const newConditon = await LoyalCustomerCondition.query()
        .delete()
        .where("id", id);

      return res.status(200).send({
        data: newConditon,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getOne = async (req: any, res: any, next: any) => {
    try {
      const id = req.params.loyalCustomerConditionId;

      const condition = await LoyalCustomerCondition.query()
        .select()
        .where("id", id)
        .first();

      return res.status(200).send({
        data: condition,
        message: "create successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAll = async (req: any, res: any, next: any) => {
    try {
      const data = await LoyalCustomerCondition.query().select();

      return res.status(200).send({
        data: data,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllCustoner = async (req: any, res: any, next: any) => {
    try {
      const listEntity = [
        "loyalcustomer.*",
        "customers.id as customerid",
        "customers.firstName as customerfirstname",
        "customers.lastName as customerlastname",
        "customers.avt as customeravt",
      ];
      const data = await LoyalCustomer.query()
        .select(...listEntity)
        .join("customers", "customers.id", "loyalcustomer.customerid");

      return res.status(200).send({
        data: data,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateStatusLoyalCustomer = async (req: any, res: any, next: any) => {
    try {
      const id = req.params.loyalCustomerId;
      const { status = "active" } = req.body;
      const data = await LoyalCustomer.query()
        .update({ status: status })
        .where("id", id);

      return res.status(200).send({
        data: data,
        message: "update successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getLoyaCustomerBySuppIdAndCusId = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const supplierId = req.query.supplierId;
      const status = "active";
      const customerId = req.user.id;

      const data = await LoyalCustomer.query()
        .select()
        .where("supplierId", supplierId)
        .andWhere("customerId", customerId)
        .andWhere("status", status);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getLoyalCustomerByLoginCustomer = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const customerId = req.user.id;

      const data = await LoyalCustomer.query()
        .select()
        .where("customerid", customerId)
        .first();

      const supplierInfor = await Suppliers.query()
        .select()
        .where("id", data.supplierId);

      return res.status(200).send({
        message: "successful",
        data: { loyalCustomer: data, supplierInfor: supplierInfor },
      });
    } catch (error) {
      console.log(error);
    }
  };
}

export default new LoyalcustomerController();
