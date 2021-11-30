import * as express from "express";
import { AuthenticationController } from "../controllers/authentication";

const router = express.Router();

/**
 * @swagger
 *  /api/:
 *    get:
 *      summary: test
 *      tags:
 *        - test api
 *      responses:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get("/", AuthenticationController.protected, async (req: any, res: any, next) => {
  try {
    const user = req.user
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
});
export default router;
