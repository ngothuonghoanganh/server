import * as express from "express";
import pricing from "../controllers/pricing";

const router = express.Router();

router.post(
    "/",
    pricing.create,
).get('/', pricing.getAll).delete('/:pricingId', pricing.delete);

export default router;
