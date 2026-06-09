import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const videoRouter = Router();
videoRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


export default videoRouter;