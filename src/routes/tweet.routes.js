import { Router } from "express";
import { createTweet, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();
tweetRouter.use(verifyJWT);



tweetRouter.route("/").post(createTweet);
tweetRouter.route("/:tweetId").patch(updateTweet);

export default tweetRouter;