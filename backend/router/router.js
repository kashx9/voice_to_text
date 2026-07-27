import { Router } from "express";
import { extractionController,classificationController } from "../controller/controller.js";
import answerQuery from "../utils/query.js";

const extractRouter = Router()
const queryResponseRouter = Router()
const classifyRouter = Router()

classifyRouter.post('/', classificationController)
extractRouter.post("/transcript",extractionController)
queryResponseRouter.post("/",answerQuery)

export { extractRouter, queryResponseRouter, classifyRouter }