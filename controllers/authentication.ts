import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { Users } from "../models/user";
import { Role } from "../models/role";

class Auth {
  private sendJWTToken = async (user: Users, statusCode: number, res: any) => {
    try {
      const token = this.signToken(user.id as any);

      const cookieOptions = {
        httpOnly: true,
      };

      res.cookie("jwt", token, cookieOptions);

      res.status(statusCode).json({
        status: "success",
        data: {
          user: user,
          token: token,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  private signToken = (id: number) => {
    try {
      return jwt.sign({ id: id }, process.env.JWT_SECRET as string);
    } catch (error) {
      console.error(error);
    }
  };

  public login = async (req: any, res: any, next: any) => {
    try {
      let { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).send("Cannot find username or password !");
      }

      const user: any = await Users.query()
        .select("users.*", "role.rolename")
        .join("role", "role.id", "users.roleid")
        .where("users.username", username)
        .andWhere("users.isdeleted", false)
        .first();
      if (user) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(400).send("Invalid Password");
        }
      } else {
        return res.status(401).send("User does not exist");
      }

      if (!user) {
        return res.status(401).send("username or password is not true");
      }
      delete user.password;

      return this.sendJWTToken(user, 200, res);
    } catch (error) {
      console.error(error);
    }
  };

  public protected = async (req: any, res: any, next: any) => {
    try {
      const token = req.cookies.jwt;
      const userId = req.headers.userid;
      const listEntity = [
        "users.id",
        "users.username",
        "users.firstname",
        "users.lastname",
        "users.email",
        "users.phone",
        "users.roleid",
        "users.createdat",
        "role.rolename",
      ];
      if (!token && !userId) {
        return res
          .status(401)
          .send("You have not login yet !! Please login to use this funciton.");
      }
      let currentUser;
      if (userId) {
        currentUser = await Users.query()
          .select(...listEntity)
          .join("role", "role.id", "users.roleid")
          .where("users.id", userId)
          .andWhere("users.isdeleted", false)
          .first();
      } else {
        const verify: any = jwt.verify(token, process.env.JWT_SECRET as string);
        currentUser = await Users.query()
          .select(...listEntity)
          .join("role", "role.id", "users.roleid")
          .where("users.id", verify.id)
          .andWhere("users.isdeleted", false)
          .first();
      }

      if (!currentUser) {
        return res.status(401).send("User attach with token are not exist");
      }
      req.user = currentUser;
      next();
    } catch (error) {
      console.error(error);
    }
  };

  public logout = async (req: any, res: any, next: any) => {
    try {
      res.clearCookie("jwt");

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      console.error(error);
    }
  };

  public loginWithGoogle = async (req: any, res: any, next: any) => {
    try {
      const {
        googleId,
        fitstName = "",
        lastName = "",
        email = "",
        phone = "",
      } = req.body;

      let user: any = await Users.query()
        .select()
        .where("googleid", googleId)
        .first();
      let role: Role = await Role.query()
        .select()
        .where("rolename", "Customer")
        .first();
      if (!user) {
        await Users.query().insert({
          googleid: googleId,
          firstname: fitstName,
          lastname: lastName,
          email: email,
          phone: phone,
          roleid: role.id,
        });
      }
      user = await Users.query()
        .select("users.*", "role.rolename")
        .join("role", "role.id", "users.roleid")
        .where("users.googleid", googleId)
        .first();
      return this.sendJWTToken(user, 200, res);
    } catch (error) {
      console.error(error);
    }
  };

  public createUser = async (req: any, res: any, next: any) => {
    try {
      let {
        username,
        password,
        firstName = "",
        lastName = "",
        email = "",
        phone,
        avt = "",
      } = req.body;

      if (!username || !password || !phone) {
        return res.status(400).send("username or phone or password does not exist!");
      }

      if(!firstName || !lastName){
        return res.status(400).send('first name, last name are required');
      }

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      let role: Role = await Role.query()
        .select()
        .where("rolename", "Customer")
        .first();

      await Users.query().insert({
        username: username,
        password: password,
        firstname: firstName,
        lastname: lastName,
        email: email,
        phone: phone,
        roleid: role.id,
        avt: avt,
      });
      // await Users.query().insert({
      //   username: username,
      //   password: password,
      //   firstname: firstName,
      //   lastname: lastName,
      //   email: email,
      //   phone: phone,
      //   roleid: 
      // })

      return res.send("register success");
    } catch (error) {
      console.error(error);
    }
  };

  //hàm này k xài
  public getAllUsers = async (req: any, res: any, next: any) => {
    try {
      // const { userId = "" } = req.params;

      const listEntity = [
        "users.id",
        "users.username",
        "users.firstname",
        "users.lastname",
        "users.email",
        "users.phone",
        "users.roleid",
        "users.createat",
        "users.avt",
        "role.rolename",
      ];

      let currentUser;
      // if (userId === null || userId === undefined || userId === "" || userId) {
      currentUser = await Users.query()
        .select(...listEntity)
        .join("role", "role.id", "users.roleid")
        .where("users.isdeleted", false)
        .andWhereNot("users.id", req.user.Id);
      // }
      //  else {
      //   currentUser = await User.query()
      //     .select(...listEntity)
      //     .join("role", "role.Id", "user.RoleId")
      //     .where("user.IsDeleted", false)
      //     .andWhereNot("user.Id", req.user.Id)
      //     .andWhere("user.Id", userId)
      //     .first();
      // }

      return res.send(currentUser);
    } catch (error) {
      console.error(error);
    }
  };

  public getMe = async (req: any, res: any, next: any) => {
    try {
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

      return res.send(
        await Users.query()
          .select(...listEntity)
          .join("role", "role.id", "users.roleid")
          .where("users.isdeleted", false)
          .andWhere("users.id", req.user.id)
          .first()
      );
    } catch (error) {
      console.error(error);
    }
  };
}

export const AuthenticationController = new Auth();
