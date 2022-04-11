import * as express from "express";
import authentication from "../controllers/authentication";
import { createValidator } from "express-joi-validation";
import { getNotifByUserIdQuerySchema } from "../services/validation/notif";
import notification from "../services/realtime/notification";

// import {notif} from "../services/realtime/notification";

const router = express.Router();
const validator = createValidator();

router.get(
    '/getByUserId',
    validator.query(getNotifByUserIdQuerySchema),
    authentication.protected,
    // Notification.get
)

router.get(
    '/getNotiForLoginUser',
    authentication.protected,
    notification.getNotiForLoginUser
)

router.put(
    '/updateNotif/notifs',
    authentication.protected,
    notification.updateNotifByListId
)

export default router;

