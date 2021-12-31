import * as express from "express";
import {
  createValidator,
} from 'express-joi-validation'


// khởi tạo validator
const validator = createValidator()
//lấy schema từ validation trong services
import { querySchema } from "../services/validation/index";

const router = express.Router();

router.get(
  "/",
  //thêm validator được xác thực bơi schema vào middleware
  validator.query(querySchema),
  async (req: any, res: any, next) => {
    try {
      return res.status(200).send(`Hello ${req.query.name}`);
    } catch (error) {
      console.log(error);
    }
  }
);
export default router;
