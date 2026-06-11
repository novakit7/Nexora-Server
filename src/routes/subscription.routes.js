import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();
subscriptionRouter.use(verifyJWT);

subscriptionRouter.route("/:channelId")

export default subscriptionRouter;