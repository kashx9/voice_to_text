import { Router } from "express";
import { extractionController } from "../controller/controller.js";

const extractRouter = Router()

extractRouter.post("/transcript",extractionController)

export default extractRouter