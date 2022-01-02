import * as express from "express";
import { createValidator } from "express-joi-validation";
import authentication from "../controllers/authentication";

// khởi tạo validator
const validator = createValidator();
//lấy schema từ validation trong services
import { querySchema } from "../services/validation/index";

const router = express.Router();

router.get(
  "/",
  authentication.protected,
  authentication.checkRole(["Supplier","Customer"]),
  //thêm validator được xác thực bơi schema vào middleware
  validator.query(querySchema),
  async (req: any, res: any, next) => {
    try {
      return res.status(200).send(req.user);
    } catch (error) {
      console.log(error);
    }
  }
);
export default router;
