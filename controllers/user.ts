import { Accounts } from "../models/accounts";
import { Customers } from "../models/customers";
import { Suppliers } from "../models/suppliers";
import bcrypt from "bcrypt";
import { Notification } from "../models/notification";

class User {
  public async listSupplier(req: any, res: any, next: any) {
    try {
      const supplier = await Suppliers.query()
        .select()
        .where("isDeleted", false);
      return res.status(200).send({
        data: supplier,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  public async getOneSupplier(req: any, res: any, next: any) {
    try {
      const supplierId = req.params.supplierId;
      const supplier = await Suppliers.query()
        .select()
        .where("isDeleted", false)
        .andWhere("id", supplierId)
        .first();
      return res.status(200).send({
        data: supplier,
        message: "get successfully",
      });
    } catch (error) {
      console.log(error);
    }
  }

  public getMe = async (req: any, res: any, next: any) => {
    try {
      return res
        .status(200)
        .send({ data: req.user, message: "get successfully" });
    } catch (error) {
      console.error(error);
    }
  };

  public updateSupplierAccount = async (req: any, res: any, next: any) => {
    try {
      const supplierId = req.params.supplierId;
      let { name, email, avt, address } = req.body;

      const updateSupp = await Suppliers.query()
        .update({
          name: name,
          email: email,
          avt: avt,
          address: address,
        })
        .where("accountId", supplierId);

      return res.status(200).send({
        data: updateSupp,
        message: "successful",
      });
    } catch (error) {
      console.log(error);
    }
  };

  public deactivateSupplierAccount = async (req: any, res: any, next: any) => {
    try {
      const supplierId = req.params.supplierId;

      const isDeleted = true;
      const isDeactivate: any = await Suppliers.query()
        .update({
          isDeleted: isDeleted,
        })
        .where("id", supplierId);

      return res.status(200).send({
        message: "deactivated user",
        Data: isDeactivate,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getAllCustomer = async (req: any, res: any, next: any) => {
    try {
      const List: any = await Customers.query()
        .select()
        .where("isDeleted", false);

      return res.status(200).send({
        message: "successful",
        data: List,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public deactivateCustomerAccount = async (req: any, res: any, next: any) => {
    try {
      const { customerId } = req.params;
      await Customers.query()
        .update({
          isDeleted: true,
        })
        .where("id", customerId);

      return res.status(200).send("successful");
    } catch (error) {
      console.log(error);
    }
  };

  public getUserByPhone = async (req: any, res: any, next: any) => {
    try {
      const { phone } = req.params;
      const account: any = await Accounts.query()
        .select()
        .where("phone", phone);

      return res.status(200).send({
        message: "list user by phone",
        data: account,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateCustomerAccountByCustomerId = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const customerid = req.user.id;
      let {
        firstName = "",
        lastName = "",
        email,
        avt = "",
        phone,
      } = req.body;

      const update = await Customers.query()
        .update({
          firstName: firstName,
          lastName: lastName,
          email: email,
          avt: avt,
        })
        .where("id", customerid);

      const accountId = await Customers.query()
        .select("accountId")
        .where("id", customerid)
        .first();

      const updatePhone = await Accounts.query()
        .update({
          phone: phone,
        })
        .where("id", accountId["accountId"]);

      return res.status(200).send({
        message: "successful",
        data: { information: update, phone: phone },
      });
    } catch (error) {
      console.log(error);
    }
  };

  public resetPassword = async (req: any, res: any, next: any) => {
    try {
      const accountId = req.body.accountId;

      let { password } = req.body;
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      const update = await Accounts.query()
        .update({
          password: password,
        })
        .where("id", accountId);
      if (update === 0) {
        return res.status(200).message("not yet updated");
      }
      return res.status(200).send({
        message: "updated password",
        data: update,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getNotiByUserId = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.id;
      const data = await Notification.query().select().where("userId", userId);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getListSupplierIdByListAccountId = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const listAccountIds = req.body.listAccountIds;
      console.log(listAccountIds);
      const data = await Suppliers.query()
        .select()
        .whereIn("accountId", listAccountIds)
        .andWhere("isDeleted", false);

      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getCustomerInforByListCustomerId = async (
    req: any,
    res: any,
    next: any
  ) => {
    try {
      const listCustomerIds = req.body.listCustomerIds;
      const customerEntity = [
        "customers.id as customerid",
        "customers.accountId as accountid",
        "customers.firstName as fistname",
        "customers.lastName as lastname",
        "customers.email as email",
        "customers.avt as avt",
        "customers.lastName as isdeleted",
        "customers.createdAt as createdat",
        "customers.updatedAt as updatedat",
        "accounts.userName as username",
        "accounts.phone as phone",
      ];

      const customerId = req.params.customerId;
      const data = await Customers.query()
        .select(...customerEntity)
        .join("accounts", "accounts.id", "customers.accountId")
        .whereIn("customers.id", listCustomerIds);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  

}
export default new User();
