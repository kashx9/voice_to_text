import { Router } from "express";
import { classificationController } from "./controller.js";

const classifyRouter = Router()

classifyRouter.post("/transcript",classificationController)

export default classifyRouter