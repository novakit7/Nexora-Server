import { Router } from "express";
import {
  allTweets,
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();
tweetRouter.use(verifyJWT);

tweetRouter.route("/").post(createTweet).get(getUserTweets);
tweetRouter.route("/:tweetId").patch(updateTweet).delete(deleteTweet);
tweetRouter.route("/all").get(allTweets);

export default tweetRouter;
