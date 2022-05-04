import { Suppliers } from "../models/suppliers";
import { Customers } from "../models/customers";
import { Accounts } from "../models/accounts";
import { CampaignOrder } from "../models/campaingorder";
import { Products } from "../models/products";
import notif from "../services/realtime/notification";
import { Order } from "../models/orders";
import { Campaigns } from "../models/campaigns";
import moment from "moment";
import dbEntity from "../services/dbEntity";


class Supplier {
  public updateWalletAccount = async (req: any, res: any, next: any) => {
    try {
      const identificationcard = req.body.identificationcard;
      const identificationimage = req.body.identificationimage;
      const ewalletcode = req.body.ewalletcode;
      const ewalletsecret = req.body.ewalletsecret;
      const supplierId = req.user.id;

      const data = await Suppliers.query()
        .update({
          identificationCard: identificationcard,
          identificationImage: JSON.stringify(identificationimage),
          eWalletCode: ewalletcode,
          eWalletSecret: ewalletsecret,
        })
        .where("id", supplierId);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public checkExistedEmail = async (req: any, res: any, next: any) => {
    // console.log("email");
    try {
      const accountEntity = [
        "accounts.id as accountid",
        "accounts.roleId as roleid",
        "accounts.username as username",
        "accounts.googleId as googleid",
        "accounts.phone as phone",
        "accounts.isDeleted as isdeleted",

      ]
      const email = req.query.email;
      // console.log(email);
      const suppData = await Suppliers.query().select(...dbEntity.supplierEntity, ...accountEntity)
        .join('accounts', 'accounts.id', 'suppliers.accountId')
        .where("suppliers.email", email);
      const cusData = await Customers.query().select(...dbEntity.customerEntity, ...accountEntity)
        .join('accounts', 'accounts.id', 'customers.accountId')
        .where("customers.email", email);
      // console.log(suppData.toString());
      return res.status(200).send({
        message: "successful",
        data: { suppData: suppData, cusData: cusData },
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });
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
      console.log(error); return res.status(400).send({ message: error });
    }
  };

  public updateWallet = async (req: any, res: any, next: any) => {
    try {
      const eWalletCode = req.body.ewalletcode;
      const eWalletSecrect = req.body.ewalletsecret;
      const supplierId = req.user.id;

      const data = await Suppliers.query()
        .update({
          eWalletCode: eWalletCode,
          eWalletSecret: eWalletSecrect,
        })
        .where("id", supplierId);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error); return res.status(400).send({ message: error });

    }
  };

  public updateIdentification = async (req: any, res: any, next: any) => {
    try {
      const identificationCard = req.body.identificationcard;
      const identificationImage = req.body.identificationimage;
      const supplierId = req.user.id;

      const data = await Suppliers.query()
        .update({
          identificationCard: identificationCard,
          identificationImage: JSON.stringify(identificationImage),
        })
        .where("id", supplierId);
      return res.status(200).send({
        message: "successful",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  };

  public getSuppInforByListSuppId = async (req: any, res: any, next: any) => {
    try {
      const supplierIds = req.body.supplierIds
      const supllierData = await Suppliers.query().select(...dbEntity.supplierEntity, 'accounts.phone')
        .join('accounts', 'accounts.id', 'suppliers.accountId')
        .whereIn('suppliers.id', supplierIds)

      return res.status(200).send({
        message: 'successful',
        data: supllierData
      })
    } catch (error) {
      console.log(error)
      return res.status(400).send({ message: error });
    }
  };

  public getUserById = async (req: any, res: any, next: any) => {
    try {
      const userId = req.body.userId;

      const supplier = await Suppliers.query()
        .select(...dbEntity.accountEntity, ...dbEntity.supplierEntity)
        .join("accounts", "accounts.id", "suppliers.accountId")
        // .join("roles", "roles.id", "accounts.roleid")

        // .join("role", "role.id", "users.roleid")
        // .where("users.isdeleted", false)
        .where("suppliers.id", userId)
        .andWhere('accounts.isDeleted', false)
        .first();

      const customer = await Customers.query()
        .select("accounts.*", "suppliers.*")
        .join("accounts", "accounts.id", "suppliers.accountId")
        // .join("roles", "roles.id", "accounts.roleid")

        .where('customers.id', userId)
        .andWhere('accounts.isDeleted', false)
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
      return res.status(400).send({ message: error });
    }
  };

  public test = async (req: any, res: any) => {
    try {
      let startable = true;
      let reason = "";
      const campaignShare = await Campaigns.query()
        .select(...dbEntity.campaignEntity)
        .where("productId", '215dba82-ae12-4bdf-8072-332278c22e5e')
        .andWhere("isShare", true)
        .andWhere("status", "active")
        .first();

      console.log(campaignShare)
      if (campaignShare) {
        startable = false;
        reason = "Another sharing campaign is ongoing";
      }
      console.log(startable)
      console.log(reason)

      return res.status(200).send({
        message: 'successful',
        data: campaignShare
      })
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });

    }
  };
}

export default new Supplier();
