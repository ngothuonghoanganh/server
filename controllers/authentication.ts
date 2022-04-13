import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// import { Users } from "../models/user";
import { Role } from "../models/role";
import { Accounts } from "../models/accounts";
import { Customers } from "../models/customers";
import { Suppliers } from "../models/suppliers";
import { SystemProfile } from "../models/systemprofile";
import console from "console";

class Authentication {
  private sendJWTToken = async (user: any, statusCode: number, res: any) => {
    try {
      const token = this.signToken({
        userid: user.id,
        rolename: user.rolename,
      } as any);

      const cookieOptions = {
        expiresIn: "24h",
      };
      let info = {};

      if (user.rolename === "Customer") {
        info = await Customers.query()
          .select()
          .where("accountid", user.id)
          .andWhere("isdeleted", false)
          .first();
      } else if (user.rolename === "Supplier") {
        info = await Suppliers.query()
          .select()
          .where("accountid", user.id)
          .andWhere("isdeleted", false)
          .first();
      } else {
        info = await SystemProfile.query()
          .select()
          .where("accountid", user.id)
          .andWhere("isdeleted", false)
          .first();
      }
      if (!info) return res.status(401).send("User does not exist");
      res.cookie("jwt", token, cookieOptions);
      res.status(statusCode).json({
        status: "success",
        data: {
          user: { ...user },
          info: { ...info },
          token: token,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  private signToken = (id: any) => {
    try {
      return jwt.sign({ ...id }, process.env.JWT_SECRET as string);
    } catch (error) {
      console.error(error);
    }
  };

  public login = async (req: any, res: any, next: any) => {
    try {
      let { username, password } = req.body;

      // if (!username || !password) {
      //   return res.status(400).send("Cannot find username or password !");
      // }

      const user: any = await Accounts.query()
        .select("accounts.*", "roles.rolename")
        .join("roles", "roles.id", "accounts.roleid")
        .where("accounts.username", username)
        .orWhere("accounts.phone", username)
        .andWhere("accounts.isdeleted", false)
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
      const token = req.cookies.jwt || req.headers.cookie;
      if (!token) {
        return res
          .status(401)
          .send("You have not login yet !! Please login to use this funciton.");
      }
      let currentUser;
      const verify: any = jwt.verify(token, process.env.JWT_SECRET as string);
      if (verify.rolename === "Supplier") {
        currentUser = await Suppliers.query()
          .select()
          .where("accountid", verify.userid)
          .andWhere("isdeleted", false)
          .first();
      } else if (verify.rolename === "Customer") {
        currentUser = await Customers.query()
          .select()
          .where("accountid", verify.userid)
          .andWhere("isdeleted", false)
          .first();
      } else {
        currentUser = await SystemProfile.query()
          .select()
          .where("accountid", verify.userid)
          .andWhere("isdeleted", false)
          .first();
      }

      if (!currentUser) {
        return res.status(401).send("User attach with token are not exist");
      }
      req.user = { ...currentUser, rolename: verify.rolename };
      next();
    } catch (error) {
      console.error(error);
    }
  };

  public logout = async (req: any, res: any, next: any) => {
    try {
      res.clearCookie("jwt");

      res.status(200).json({
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
        firstName = "",
        lastName = "",
        email = "",
        phone = "",
        roleName = "Customer",
        address = "",
      } = req.body;

      if (!googleId) {
        return res.status(400).send({
          message: "login failed",
          data: null,
        });
      }
      let user: any = await Accounts.query()
        .select()
        .where("googleid", googleId)
        .first();
      let role: Role = await Role.query()
        .select()
        .where("rolename", roleName)
        .first();

      if (!user) {
        const newAccount = await Accounts.query().insert({
          googleid: googleId,
          roleid: role.id,
          phone: phone,
        });
        let newUser;
        if (roleName === "Customer") {
          newUser = await Customers.query().insert({
            accountid: newAccount.id,
            firstname: firstName,
            lastname: lastName,
            email: email,
          });

          delete newAccount.password;
        }
        if (roleName === "Supplier") {
          newUser = await Suppliers.query().insert({
            accountid: newAccount.id,
            name: firstName + " " + lastName,
            email: email,
            address: address,
          });

          delete newAccount.password;
        }
      }

      user = await Accounts.query()
        .select("accounts.*", "roles.rolename")
        .join("roles", "roles.id", "accounts.roleid")
        .where("accounts.googleid", googleId)
        .first();
      return this.sendJWTToken(user, 200, res);
    } catch (error: any) {
      console.error(error);
      if (
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        return res.status(400).send({
          message:
            "username, google id and phone must be unique",
          data: null,
        });
      }
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
        phone="",
        address = "",
        roleName = "Customer",
      } = req.body;

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      let role: Role = await Role.query()
        .select()
        .where("rolename", roleName)
        .first();

      const newAccount = await Accounts.query().insert({
        username: username,
        password: password,
        roleid: role.id,
        phone: phone,
      });
      let newUser;
      if (roleName === "Customer") {
        newUser = await Customers.query().insert({
          accountid: newAccount.id,
          firstname: firstName,
          lastname: lastName,
          email: email,
        });

        delete newAccount.password;
      }
      if (roleName === "Supplier") {
        newUser = await Suppliers.query().insert({
          accountid: newAccount.id,
          name: firstName + " " + lastName,
          email: email,
          address: address,
        });

        delete newAccount.password;
      }

      return res.status(200).send({
        data: {
          ...newAccount,
          ...newUser,
        },
        message: "register success",
      });
    } catch (error: any) {
      console.log(error);
      if (
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        return res.status(400).send({
          message:
            "username or phone is exist in system, please use another one.",
          data: null,
        });
      }
    }
  };

  //   //do not use
  //   public getAllUsers = async (req: any, res: any, next: any) => {
  //     try {
  //       // const { userId = "" } = req.params;

  //       const listEntity = [
  //         "users.id",
  //         "users.username",
  //         "users.firstname",
  //         "users.lastname",
  //         "users.email",
  //         "users.phone",
  //         "users.roleid",
  //         "users.createat",
  //         "users.avt",
  //         "role.rolename",
  //       ];

  //       let currentUser;
  //       // if (userId === null || userId === undefined || userId === "" || userId) {
  //       currentUser = await Users.query()
  //         .select(...listEntity)
  //         .join("role", "role.id", "users.roleid")
  //         .where("users.isdeleted", false)
  //         .andWhereNot("users.id", req.user.Id);
  //       // }
  //       //  else {
  //       //   currentUser = await User.query()
  //       //     .select(...listEntity)
  //       //     .join("role", "role.Id", "user.RoleId")
  //       //     .where("user.IsDeleted", false)
  //       //     .andWhereNot("user.Id", req.user.Id)
  //       //     .andWhere("user.Id", userId)
  //       //     .first();
  //       // }

  //       return res.send(currentUser);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  public checkRole = (roles: Array<string>) => {
    // console.log(role)
    return (req: any, res: any, next: any) => {
      const user = req.user;
      // console.log(user);
      if (!roles.includes(user.rolename)) {
        return res.status(403).send("this user don't have permission");
      }
      return next();
    };
  };
}

export default new Authentication();
