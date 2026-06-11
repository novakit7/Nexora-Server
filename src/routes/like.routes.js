import { Router } from "express";
import {
    getLikedTweets,
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const likeRouter = Router();
likeRouter.use(verifyJWT);

likeRouter.route("/videos").get(getLikedVideos);
likeRouter.route("/tweets").get(getLikedTweets);
likeRouter.route("/comment/:commentId").post(toggleCommentLike);
likeRouter.route("/video/:videoId").post(toggleVideoLike);
likeRouter.route("/tweet/:tweetId").post(toggleTweetLike);

export default likeRouter;
