import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const playlistRouter = Router();
playlistRouter.use(verifyJWT);

playlistRouter.route("/")
  .post(createPlaylist)
  .get(getUserPlaylists);

playlistRouter.route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

playlistRouter.patch(
  "/:playlistId/videos/:videoId",
  addVideoToPlaylist
);

playlistRouter.delete(
  "/:playlistId/videos/:videoId",
  removeVideoFromPlaylist
);

export default playlistRouter;
