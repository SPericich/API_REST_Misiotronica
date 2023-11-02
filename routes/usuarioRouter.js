import express from "express"
import tokenAuthentication from "../middlewares/tokenAuthentication.js"

const usuarioRouter = express.Router();

import { getAllUsers, getOneUserById, getAllUsersByRol, getProfile, addUserClient, addUserAdmin, addUserProvider, updateProfileUser, updateProfileClient, updateProfileProvider, updateProfileAdmin, stateUserById} from "../controllers/usuarioController.js"

usuarioRouter.get('/usuarios', tokenAuthentication,getAllUsers)
usuarioRouter.get('/usuarios/:id', tokenAuthentication, getOneUserById)
usuarioRouter.get('/roles/usuarios/:rolcod', tokenAuthentication, getAllUsersByRol)
usuarioRouter.get('/perfil/usuarios', tokenAuthentication, getProfile)
usuarioRouter.post('/registro/cliente', addUserClient)
usuarioRouter.post('/registro/administrador', tokenAuthentication, addUserAdmin)
usuarioRouter.post('/registro/proveedor', addUserProvider)
usuarioRouter.patch('/cuenta/usuarios', tokenAuthentication, updateProfileUser)
usuarioRouter.patch('/perfil/cliente', tokenAuthentication, updateProfileClient)
usuarioRouter.patch('/perfil/proveedor', tokenAuthentication, updateProfileProvider)
usuarioRouter.patch('/perfil/administrador', tokenAuthentication, updateProfileAdmin)
usuarioRouter.patch('/estado/usuarios/:id', tokenAuthentication, stateUserById)

export default usuarioRouter