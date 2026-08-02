import ingestController from "../controller/ingestController.js"
import {Router} from 'express'

const ingestRouter = Router()

ingestRouter.post("/",ingestController)

export default ingestRouter