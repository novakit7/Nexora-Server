import { Router } from "express";
import { logOutUser, registerUser, signInUser } from "../controllers/User.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

userRouter.route("/login").post(signInUser);

//secured routes......
userRouter.route("/logout").post(verifyJWT, logOutUser)

export default userRouter;
