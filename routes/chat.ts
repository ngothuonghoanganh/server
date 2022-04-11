import * as express from "express";
import authentication from "../controllers/authentication";
import chat from "../controllers/chat";
import { createValidator } from "express-joi-validation";
import {
  getChatMessageBodySchema,
  updateStatusBodySchema,
} from "../services/validation/chat";

const validator = createValidator();
const router = express.Router();

router.get(
  "/chatMessage/customerId",
  authentication.protected,
  // authentication.checkRole(["Customer"]),
  chat.getChatMessageByCustomer
);

router.post(
  "/getChatMessage/SenderOrReceiver",
  authentication.protected,
  authentication.checkRole(["Customer"]),
  validator.body(getChatMessageBodySchema),
  chat.getChatMessageBySenderOrReceiver
);

router.post(
  "/updateStatusToRead",
  validator.body(updateStatusBodySchema),
  chat.updateChatMessageToRead
);

router.post(
  "/getAllowTime",
  // validator.body(updateStatusBodySchema),
  chat.getChatAllowTime
);

export default router;
