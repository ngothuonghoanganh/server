
import * as express from "express";
import authentication from "../controllers/authentication";
import chat from "../controllers/chat";
import { createValidator } from "express-joi-validation";


const validator = createValidator();
const router = express.Router();

router.get(
    '/chatMessage/customerId',
    authentication.protected,
    authentication.checkRole(["Customer"]),
    chat.getChatMessageByCustomer
)

router.post(
    '/getChatMessage/SenderOrReceiver',
    authentication.protected,
    authentication.checkRole(["Customer"]),
    chat.getChatMessageBySenderOrReceiver
)


export default router;

