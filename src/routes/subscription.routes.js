import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();
subscriptionRouter.use(verifyJWT);

subscriptionRouter
  .route("/:channelId")
  .post(toggleSubscription)
  .get(getUserChannelSubscribers);
subscriptionRouter.route("/").get(getSubscribedChannels);

export default subscriptionRouter;
