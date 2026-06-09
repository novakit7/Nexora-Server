import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import commentRouter from "./comment.routes.js";

const videoRouter = Router();
videoRouter.use(verifyJWT);

videoRouter.use("/comments", commentRouter);
videoRouter
  .route("/")
  .post(
    upload.fields([
      {
        name: "video",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo,
  )
  .get(getAllVideos);
videoRouter
  .route("/:videoId")
  .get(getVideoById)
  .patch(updateVideo)
  .delete(deleteVideo);

  videoRouter.patch("/:videoId/publish", togglePublishStatus);

export default videoRouter;
