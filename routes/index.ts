import * as express from "express";
import { getDatabase, ref, set } from "firebase/database";
import { database } from "../models/firebase/firebase";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";

// khởi tạo validator
const validator = createValidator();
//lấy schema từ validation trong services
import { querySchema } from "../services/validation/index";

const router = express.Router();

router.get(
  "/",
  // authentication.protected,
  // authentication.checkRole(["Supplier", "Customer"]),
  //thêm validator được xác thực bơi schema vào middleware
  // validator.query(querySchema),
  async (req: any, res: any, next) => {
    try {
      database.ref("users/8e77e9fa-7a91-4a0c-a83e-0525726bbdca").push({
        helloword: "hellos",
      });

      // const data = await database.ref("users/8e77e9fa-7a91-4a0c-a83e-0525726bbdca").get()
      // set(
      //   ref(database as any, "users/" + "8e77e9fa-7a91-4a0c-a83e-0525726bbdca"),
      //   {
      //     username: "test1",
      //   }
      // );
      return res.status(200).send("successful");
    } catch (error) {
      console.log(error);
    }
  }
);
export default router;
