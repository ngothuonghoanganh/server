import * as express from "express";
import { createValidator } from "express-joi-validation";
import Authentication from "../controllers/authentication";
import CampaignController from "../controllers/campaign";
import { Products } from "../models/products";
import {
  paramsSchema,
  querySchema,
} from "../services/validation/campaign";

const validator = createValidator();

const router = express.Router();

router.post(
  "/",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  // validator.body(bodySchema),
  CampaignController.createCampaign
);

router.post(
  '/searchCampaign',
  CampaignController.searchCampaign
)


router.put(
  '/update/active',
  // Authentication.protected,
  // Authentication.checkRole(["Supplier"]),
  validator.body(paramsSchema),
  CampaignController.changeStatusToActive
)

router.get(
  "/All",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  CampaignController.getAllCampaignsInSupplier
);

router.get(
  '/getEndingCampaignList',
  CampaignController.getEndingCampaignList
  )

router.get(
  "/",
  validator.query(querySchema),
  CampaignController.getAllCampaigns
);

router.get(
  "/:campaignId",
  validator.params(paramsSchema),
  CampaignController.getOneCampaignByCampaignId
);

router.delete(
  "/:campaignId",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  validator.params(paramsSchema),
  CampaignController.deleteCampaign
);

router.put(
  "/:campaignId",
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  // validator.params(paramsSchema),
  // validator.body(bodySchema),
  CampaignController.updateCampaign
);

router.put(
  '/supplier/doneCampaign',
  Authentication.protected,
  Authentication.checkRole(["Supplier"]),
  CampaignController.doneCampaignBySupp

)


router.post("/product", CampaignController.getAllCampaignsAllowProductId);

export default router;
