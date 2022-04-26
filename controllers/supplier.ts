import { Suppliers } from "../models/suppliers";
import { Customers } from "../models/customers";
import { Accounts } from "../models/accounts";
import { CampaignOrder } from "../models/campaingorder";
import { Products } from "../models/products";
import notif from "../services/realtime/notification";
import { Order } from "../models/orders";
import { Campaigns } from "../models/campaigns";
import moment from "moment";


class Supplier {
  public updateWalletAccount = async (req: any, res: any, next: any) => {
    try {
      const identificationCard = req.body.identificationcard;
      const identificationImage = req.body.identificationimage;
      const eWalletCode = req.body.ewalletcode;
      const eWalletSecrect = req.body.ewalletsecret;
      const supplierId = req.user.id;

      const data = await Suppliers.query()
        .update({
          identificationcard: identificationCard,
          identificationimage: JSON.stringify(identificationImage),
          ewalletcode: eWalletCode,
          ewalletsecrect: eWalletSecrect,
        })
        .where("id", supplierId);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public checkExistedEmail = async (req: any, res: any, next: any) => {
    // console.log("email");
    try {
      const accountEntity = [
        "accounts.id as accountid",
        "accounts.roleid as roleid",
        "accounts.username as username",
        "accounts.googleid as googleid",
        "accounts.phone as phone",
        "accounts.isdeleted as isdeleted",

      ]
      const email = req.query.email;
      // console.log(email);
      const suppData = await Suppliers.query().select('suppliers.*', ...accountEntity)
        .join('accounts', 'accounts.id', 'suppliers.accountid')
        .where("suppliers.email", email);
      const cusData = await Customers.query().select('customers.*', ...accountEntity)
        .join('accounts', 'accounts.id', 'customers.accountid')
        .where("customers.email", email);
      // console.log(suppData.toString());
      return res.status(200).send({
        message: "successful",
        data: { suppData: suppData, cusData: cusData },
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateProfile = async (req: any, res: any, next: any) => {
    try {
      const { name, email, address, phone, avatar } = req.body;
      await Promise.all([
        Suppliers.query()
          .update({
            name: name,
            email: email,
            address: address,
            avt: JSON.stringify(avatar),
          })
          .where("id", req.user.id),
        phone ?
          Accounts.query()
            .update({ phone: phone })
            .where("id", req.user.accountid) : null
      ]);

      const [updateProfile, updateAccount] = await Promise.all([
        Suppliers.query().select().where("id", req.user.id).first(),
        Accounts.query().select().where("id", req.user.accountid).first(),
      ]);

      return res.status(200).send({
        message: "successful",
        data: { account: updateAccount, profile: updateProfile },
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateWallet = async (req: any, res: any, next: any) => {
    try {
      const eWalletCode = req.body.ewalletcode;
      const eWalletSecrect = req.body.ewalletsecret;
      const supplierId = req.user.id;

      const data = await Suppliers.query()
        .update({
          ewalletcode: eWalletCode,
          ewalletsecrect: eWalletSecrect,
        })
        .where("id", supplierId);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public updateIdentification = async (req: any, res: any, next: any) => {
    try {
      const identificationCard = req.body.identificationcard;
      const identificationImage = req.body.identificationimage;
      const supplierId = req.user.id;

      const data = await Suppliers.query()
        .update({
          identificationcard: identificationCard,
          identificationimage: JSON.stringify(identificationImage),
        })
        .where("id", supplierId);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  public getSuppInforByListSuppId = async (req: any, res: any, next: any) => {
    try {
      const supplierIds = req.body.supplierIds
      const supllierData = await Suppliers.query().select('suppliers.*', 'accounts.phone')
        .join('accounts', 'accounts.id', 'suppliers.accountid')
        .whereIn('suppliers.id', supplierIds)

      return res.status(200).send({
        message: 'successful',
        data: supllierData
      })
    } catch (error) {
      console.log(error)
    }
  };

  public getUserById = async (req: any, res: any, next: any) => {
    try {
      const userId = req.body.userId;

      const supplier = await Suppliers.query()
        .select("accounts.*", 'suppliers.*')
        .join("accounts", "accounts.id", "suppliers.accountid")
        // .join("roles", "roles.id", "accounts.roleid")

        // .join("role", "role.id", "users.roleid")
        // .where("users.isdeleted", false)
        .where("suppliers.id", userId)
        .andWhere('accounts.isdeleted', false)
        .first();

      const customer = await Customers.query()
        .select("accounts.*", "suppliers.*")
        .join("accounts", "accounts.id", "suppliers.accountid")
        // .join("roles", "roles.id", "accounts.roleid")

        .where('customers.id', userId)
        .andWhere('accounts.isdeleted', false)
        .first()

      return res.status(200).send({
        message: 'successful',
        data: ({
          supplier: supplier,
          customer: customer
        })
      })
    } catch (error) {
      console.error(error);
    }
  };

  public test = async (req: any, res: any) => {
    try {
      var currentDate = moment().format();

      return res.status(200).send({
        message: 'successful',
        data: currentDate
      })
    } catch (error) {
      console.log(error)
    }
  };
}

export default new Supplier();
