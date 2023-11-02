import express from "express"
import tokenAuthentication from "../middlewares/tokenAuthentication.js"

const extraRouter = express.Router();

import { createRoles, createEstados} from "../controllers/extraControllers.js"

extraRouter.post('/roles', tokenAuthentication, createRoles)
extraRouter.post('/estados', tokenAuthentication, createEstados)


export default extraRouter