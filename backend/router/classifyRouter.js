import {Router} from 'express'
import { classificationController } from '../controller/classificationController.js'

const classifyRouter = Router()

classifyRouter.post('/', classificationController)

export default classifyRouter