import express from "express"
import tokenAuthentication from "../middlewares/tokenAuthentication.js"

const carritoRouter = express.Router();

import { addProductToCart, getCart, updateSale, deleteSale, deleteCart, cartHistory} from "../controllers/carritoController.js"

carritoRouter.post('/cliente/venta', tokenAuthentication, addProductToCart)
carritoRouter.get('/cliente/carrito', tokenAuthentication, getCart)
carritoRouter.patch('/cliente/carrito/modificarventa', tokenAuthentication, updateSale)
carritoRouter.patch('/cliente/carrito/eliminarventa', tokenAuthentication, deleteSale)
carritoRouter.delete('/cliente/carrito/eliminarcarrito', tokenAuthentication, deleteCart)
carritoRouter.get('/cliente/miscompras', tokenAuthentication, cartHistory)

export default carritoRouter