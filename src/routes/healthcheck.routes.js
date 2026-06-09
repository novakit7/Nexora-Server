import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const healthRouter = Router();

healthRouter.route("/health-check").get(healthCheck);
export default healthRouter;