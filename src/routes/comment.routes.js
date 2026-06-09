import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const commentRouter = Router();
commentRouter.use(verifyJWT);

commentRouter.route("/:videoId").post(addComment).get(getVideoComments);
commentRouter.route("/:commentId").patch(updateComment).delete(deleteComment);

export default commentRouter;