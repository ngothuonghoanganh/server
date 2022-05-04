import * as express from "express";
import { database } from "../models/firebase/firebase";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";
import notification from "../services/realtime/notification";
// khởi tạo validator
const validator = createValidator();
//lấy schema từ validation trong services
import { querySchema } from "../services/validation/index";
import Payment from "../controllers/payment";
import { createClient } from "redis";

const router = express.Router();

router.get(
  "/",
  authentication.protected,
  // authentication.checkRole(["Supplier", "Customer"]),
  //thêm validator được xác thực bơi schema vào middleware
  // validator.query(querySchema),
  async (req: any, res: any, next) => {
    try {
      // const client = createClient();
      // client.on("error", (err) => console.log("Redis Client Error", err));
      // await client.connect();
      // await client.set(
      //   "test",
      //   JSON.stringify({
      //     test: "successful",
      //   })
      // );
      console.log(req.user);
      // console.log(await client.get("query"));
      return res.status(200).send("test commit 1");
    } catch (error) {
      console.log(error);
      return res.status(400).send({ message: error });
    }
  }
);

router.post("/", Payment.createPayment);

export default router;
