import { Router } from "express";
import answerQuery from "../utils/query.js"

const queryResponseRouter = Router()

queryResponseRouter.post("/",answerQuery)

export default queryResponseRouter