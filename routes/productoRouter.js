import express from "express";
import tokenAuthentication from "../middlewares/tokenAuthentication.js";

const productoRouter = express.Router();

import {
	getAllProducts,
	getProductById,
	addNewProduct,
	updateProductById,
	stateProductById,
} from "../controllers/productoController.js";

productoRouter.get('/productos', getAllProducts);
productoRouter.get('/productos/:id', getProductById);
productoRouter.post('/proveedor/productos', tokenAuthentication, addNewProduct);
productoRouter.patch('/datos/productos/:id', tokenAuthentication, updateProductById);
productoRouter.patch('/estado/productos/:id', tokenAuthentication, stateProductById);

export default productoRouter;
