import { Router } from "express";
import { extractionController } from "../controller/controller.js";
import answerQuery from "../utils/query.js";

const extractRouter = Router()
const queryResponseRouter = Router()

extractRouter.post("/transcript",extractionController)
queryResponseRouter.post("/",answerQuery)

export { extractRouter, queryResponseRouter }