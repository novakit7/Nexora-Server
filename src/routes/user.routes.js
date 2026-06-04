import { Router } from "express";
import { resisterUser } from "../controllers/User.controller.js";

const userRouter = Router();

userRouter.route("/register").post(resisterUser);

export default userRouter;
