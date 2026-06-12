import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const playlistRouter = Router();
playlistRouter.use(verifyJWT);


export default playlistRouter;