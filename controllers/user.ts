// import { Users } from "../models/user";
// import bcrypt from "bcrypt";
// import console from "console";
// import { rmSync } from "fs";


import { Accounts } from "../models/accounts";
import { Customers } from "../models/customers";
import { Suppliers } from "../models/suppliers";
import bcrypt from "bcrypt";
import {Notification} from "../models/notification";
import notification from "../services/realtime/notification";

class User {
  public async listSupplier(req: any, res: any, next: any) {
    try {
      const supplier = await Suppliers.query()
        .select()
        .where("isdeleted", false);
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
        .where("isdeleted", false)
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

  //do not use
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
        .where("accountid", supplierId);

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
      // console.log(req.user.id);
      // console.log(supplierId);

      const isDeleted = true;
      const isDeactivate: any = await Suppliers.query()
        .update({
          isdeleted: isDeleted,
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
        .where("isdeleted", false);

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
          isdeleted: true,
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
        .where('phone', phone)
      
      // const supplier:any=await Suppliers.query().select().where('phone', phone)
      // account.password.delete
      
      // notification.sendNotiForWeb({
      //   userId: "abct",
      //   link: "test link",
      //   message: "test"
      // })
      return res.status(200).send({
        message: 'list user by phone',
        data: account
      })
    } catch (error) {
      console.log(error);
    }
  };

  public updateCustomerAccountByCustomerId = async(req: any, res: any, next: any)=>{
    try{
      const customerid= req.user.id
      let {
        firstName="",
        lastName="",
        email, 
        avt=""

      }=req.body
      // console.log(customerid + 'test')
      const update=await Customers.query().update({
        firstname: firstName,
        lastname: lastName,
        email: email,
        avt: avt,
      })
      .where('id', customerid)
      return res.status(200).send({
        message: 'successful',
        data: update
      })
    }catch(error){
      console.log(error)
    }
  };

  public resetPasswordForCustomer = async(req: any,  res: any,  next: any)=>{
    try{
      const accountId=req.user.accountid;
      // console.log(accountId)
      let{
        password
      }= req.body;
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      // console.log(password)
      const update = await Accounts.query()
      .update({
        password: password
      })
      .where('id', accountId);
      if(update===0){
        return res.status(200).message('not yet updated')
      }
      return res.status(200).send({
        message: 'updated password',
        data: update
      })
    }catch(error){
      console.log(error)
    }
  };

  public getNotiByUserId = async(req: any, res: any, next: any)=>{
    try{
      const userId=req.user.id;
      const data = await Notification.query()
      .select()
      .where('userid', userId)
      
      return res.status(200).send({
        message: 'successful',
        data: data
      })
    }catch(error){
      console.log(error)
    }
  };

  public getListSupplierIdByListAccountId = async (req: any , res: any, next: any)=>{
    try {
      const listAccountIds=  req.body.listAccountIds;
      console.log(listAccountIds)
      const data = await Suppliers.query()
        .select()
        .whereIn('accountid', listAccountIds)
        .andWhere('isdeleted', false)

        return res.status(200).send({
          message: 'successful',
          data: data
        })
    } catch (error) {
      console.log(error)
    }
  }

}
export default new User();

// class UsersController {
//   //do not use
//   public getUser = async (req: any, res: any, next: any) => {
//     try {
//       const { userId = "" } = req.params;
//       if (userId === null || userId === undefined || userId === "" || !userId) {
//         return res.status(400).send("Id is not empty");
//       }
//       const listEntity = [
//         "users.id",
//         "users.username",
//         "users.firstname",
//         "users.lastname",
//         "users.email",
//         "users.phone",
//         "users.roleid",
//         "users.createdat",
//         "users.avt",
//         "role.rolename",
//       ];
//       let currentUser = await Users.query()
//         .select(...listEntity)
//         .join("role", "role.id", "users.roleid")
//         .where("users.isdeleted", false)
//         .andWhereNot("users.id", req.user.Id)
//         .andWhere("users.id", userId)
//         .first();

//       return res.send(currentUser);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   public listUser = async (req: any, res: any, next: any) => {
//     try {
//       const List = await Users.query().select();
//       return res.send(List);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   public updateUser = async (req: any, res: any, next: any) => {
//     try {
//       const { userId } = req.params;

//       let {
//         password,
//         firstName = "",
//         lastName = "",
//         email = "",
//         avt = "",
//       } = req.body;
//       if (!userId || userId === "") {
//         return res.status(400).send("Id is not empty");
//       }
//       // if (!userName || userName === "") {
//       //   return res.status(400).send("username is not empty");
//       // }
//       if (password) {
//         const salt = await bcrypt.genSalt(10);
//         password = await bcrypt.hash(password, salt);
//         await Users.query()
//           .update({
//             password: password,
//           })
//           .where("id", userId)
//           .andWhere("isdeleted", false);
//       }
//       await Users.query()
//         .update({
//           firstname: firstName,
//           lastname: lastName,
//           email: email,
//           avt: avt,
//         })
//         .where("id", userId)
//         .andWhere("isdeleted", false);
//       return res.send("Update successful");
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   public deleteUser = async (req: any, res: any, next: any) => {
//     try {
//       const { userId } = req.params;
//       if (!userId || userId === "") {
//         return res.send("Id is not empty");
//       }
//       await Users.query()
//         .update({
//           isdeleted: true,
//         })
//         .where("id", userId)
//         .andWhere("isdeleted", false);
//       return res.send("Delete successful");
//     } catch (error) {
//       console.error(error);
//     }
//   };

  

// export const UserController = new UsersController();
