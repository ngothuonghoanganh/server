import { Users } from "../models/user";
import bcrypt from "bcrypt";
import console from "console";

class UsersController {
  //do not use
  public getUser = async (req: any, res: any, next: any) => {
    try {
      const { userId = "" } = req.params;
      if (userId === null || userId === undefined || userId === "" || !userId) {
        return res.status(400).send("Id is not empty");
      }
      const listEntity = [
        "users.id",
        "users.username",
        "users.firstname",
        "users.lastname",
        "users.email",
        "users.phone",
        "users.roleid",
        "users.createdat",
        "users.avt",
        "role.rolename",
      ];
      let currentUser = await Users.query()
        .select(...listEntity)
        .join("role", "role.id", "users.roleid")
        .where("users.isdeleted", false)
        .andWhereNot("users.id", req.user.Id)
        .andWhere("users.id", userId)
        .first();

      return res.send(currentUser);
    } catch (error) {
      console.error(error);
    }
  };

  public listUser = async (req: any, res: any, next: any) => {
    try {
      const List = await Users.query().select();
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
          .where("id", userId)
          .andWhere("isdeleted", false);
      }
      await Users.query()
        .update({
          firstname: firstName,
          lastname: lastName,
          email: email,
          avt: avt,
        })
        .where("id", userId)
        .andWhere("isdeleted", false);
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
        .where("id", userId)
        .andWhere("isdeleted", false);
      return res.send("Delete successful");
    } catch (error) {
      console.error(error);
    }
  };
}

export const UserController = new UsersController();
