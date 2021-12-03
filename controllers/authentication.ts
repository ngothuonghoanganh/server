import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { User } from "../models/user";
import { Role } from "../models/role";

class Auth {
  private sendJWTToken = async (user: User, statusCode: number, res: any) => {
    try {
      const token = this.signToken(user.Id as any);

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

      const user: any = await User.query()
        .select()
        .select("users.*", "role.RoleName")
        .join("role", "role.Id", "users.RoleId")
        .where("users.UserName", username)
        .andWhere("user.IsDeleted", false)
        .first();
      if (user) {
        const validPassword = await bcrypt.compare(password, user.Password);
        if (!validPassword) {
          return res.status(400).send("Invalid Password");
        }
      } else {
        return res.status(401).send("User does not exist");
      }

      if (!user) {
        return res.status(401).send("username or password not true");
      }
      delete user.Password;

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
        "users.Id",
        "users.UserName",
        "users.FirstName",
        "users.LastName",
        "users.Email",
        "users.Phone",
        "users.RoleId",
        "users.CreateDate",
        "role.RoleName",
      ];
      if (!token && !userId) {
        return res
          .status(401)
          .send("You have not login yet !! Please login to use this funciton.");
      }
      let currentUser;
      if (userId) {
        currentUser = await User.query()
          .select(...listEntity)
          .join("role", "role.Id", "users.RoleId")
          .where("users.Id", userId)
          .andWhere("users.IsDeleted", false)
          .first();
      } else {
        const verify: any = jwt.verify(token, process.env.JWT_SECRET as string);
        currentUser = await User.query()
          .select(...listEntity)
          .join("role", "role.Id", "users.RoleId")
          .where("users.Id", verify.id)
          .andWhere("users.IsDeleted", false)
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

      let user: any = await User.query()
        .select()
        .where("googleId", googleId)
        .first();
      let role: Role = await Role.query()
        .select()
        .where("RoleName", "Audience")
        .first();
      if (!user) {
        await User.query().insert({
          GoogleId: googleId,
          FirstName: fitstName,
          LastName: lastName,
          Email: email,
          Phone: phone,
          RoleId: role.Id,
        });
      }
      user = await User.query()
        .select("users.*", "role.RoleName")
        .join("role", "role.Id", "users.RoleId")
        .where("users.googleId", googleId)
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
        phone = "",
        avt = "",
      } = req.body;

      if (!username || !password) {
        return res.status(400).send("username or password does not exist!");
      }

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      let role: Role = await Role.query()
        .select()
        .where("RoleName", "Customer")
        .first();

      await User.query().insert({
        UserName: username,
        Password: password,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        RoleId: role.Id,
        Avt: avt,
      });

      return res.send("register success");
    } catch (error) {
      console.error(error);
    }
  };

  public getAllUsers = async (req: any, res: any, next: any) => {
    try {
      // const { userId = "" } = req.params;

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

      let currentUser;
      // if (userId === null || userId === undefined || userId === "" || userId) {
      currentUser = await User.query()
        .select(...listEntity)
        .join("role", "role.Id", "users.RoleId")
        .where("users.IsDeleted", false)
        .andWhereNot("users.Id", req.user.Id);
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

      return res.send(
        await User.query()
          .select(...listEntity)
          .join("role", "role.Id", "users.RoleId")
          .where("users.IsDeleted", false)
          .andWhere("users.Id", req.user.Id)
          .first()
      );
    } catch (error) {
      console.error(error);
    }
  };
}

export const AuthenticationController = new Auth();
