import { Users } from "../models/user";
import bcrypt from "bcrypt";
import console from "console";

class Us {
  public getUser = async (req: any, res: any, next: any) => {
    try {
      const { userId = "" } = req.params;
      if (userId === null || userId === undefined || userId === "" || !userId) {
        return res.status(400).send("Id is not empty");
      }
      const listEntity = [
        "users.Id",
        "users.UserName",
        "users.FirstName",
        "users.LastName",
        "users.Email",
        "users.Phone",
        "users.RoleId",
        "users.CreateDate",
        "users.Avt",
        "role.RoleName",
      ];
      let currentUser = await Users.query()
        .select(...listEntity)
        .join("role", "role.Id", "users.RoleId")
        .where("users.IsDeleted", false)
        .andWhereNot("users.Id", req.user.Id)
        .andWhere("users.Id", userId)
        .first();

      return res.send(currentUser);
    } catch (error) {
      console.error(error);
    }
  };

  public listUser = async (req: any, res: any, next: any) => {
    try {
      const List = await Users.query().select().where("IsDeleted", false);
      return res.send(List);
    } catch (error) {
      console.error(error);
    }
  };

  public updateUser = async (req: any, res: any, next: any) => {
    try {
      const { userId } = req.params;

      let {
        password,
        firstName = "",
        lastName = "",
        email = "",
        phone = "",
        avt = "",
      } = req.body;
      if (!userId || userId === "") {
        return res.status(400).send("Id is not empty");
      }
      // if (!userName || userName === "") {
      //   return res.status(400).send("username is not empty");
      // }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        await Users.query()
          .update({
            password: password,
          })
          .where("Id", userId)
          .andWhere("IsDeleted", false);
      }
      await Users.query()
        .update({
          firstname: firstName,
          lastname: lastName,
          email: email,
          phone: phone,
          avt: avt,
        })
        .where("Id", userId)
        .andWhere("IsDeleted", false);
      return res.send("Update successful");
    } catch (error) {
      console.error(error);
    }
  };

  public deleteUser = async (req: any, res: any, next: any) => {
    try {
      const { userId } = req.params;
      if (!userId || userId === "") {
        return res.send("Id is not empty");
      }
      await Users.query()
        .update({
          isdeleted: true,
        })
        .where("Id", userId)
        .andWhere("IsDeleted", false);
      return res.send("Delete successful");
    } catch (error) {
      console.error(error);
    }
  };
}

export const UserController = new Us();
