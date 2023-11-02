import express from "express";
import db from "./db/connection.js";

import authentication from "./middlewares/authentication.js";

import productoRouter from "./routes/productoRouter.js";
import usuarioRouter from "./routes/usuarioRouter.js";
import carritoRouter from "./routes/carritoRouter.js";
import extraRouter from "./routes/extraRouter.js";

const html =
	"<h1>Bienvenido a la API de Misiotrónica</h1><p>Los comandos disponibles son:</p><ul><li>GET: /usuarios</li><li>GET: /usuarios/id</li><li>GET: /roles/usuarios/rolcod</li><li>GET: /perfil/usuarios</li><li>POST: /registro/cliente</li><li>POST: /registro/administrador</li><li>POST: /registro/proveedor</li><li>PATCH: /cuenta/usuarios</li><li>PATCH: /perfil/cliente</li><li>PATCH: /perfil/proveedor</li><li>PATCH: /perfil/administrador</li><li>PATCH: /estado/usuarios/id</li><li>GET: /productos</li><li>GET: /productos/id</li><li>POST: /proveedor/productos</li><li>PATCH: /datos/productos/id</li><li>PATCH: /estado/productos/id</li><li>POST: /cliente/venta</li><li>GET: /cliente/carrito</li> <li>PATCH: /cliente/carrito/modificarventa</li> <li>DELETE: /cliente/carrito/eliminarcarrito</li><li>GET: /cliente/miscompras</li></ul>";

const app = express();

const exposedPort = 1234;

app.use(express.json());

db.sync({ force: false }) // sincronizo modelos con la base de datos
	.then(() => {
		console.log("Conexión a la base de datos establecida correctamente");
	})
	.catch((error) => {
		console.error("Error al conectar a la base de datos:", error);
	});

app.get("/", (req, res) => {
	res.status(200).send(html);
});

//Enrutamiento
app.use("/", productoRouter);
app.use("/", usuarioRouter);
app.use("/", carritoRouter);
app.use("/", extraRouter);

//Endpoint para obtener el token
app.post("/auth", authentication);

app.use((req, res) => {
	res.status(404).send("<h1>404</h1>");
});

try {
	await db.authenticate();
	console.log("La conexión se ha establecido exitosamente");
} catch (error) {
	console.error("No se puede conectar a la base de datos:", error);
}

app.listen(exposedPort, () => {
	console.log("Servidor escuchando en http://localhost:" + exposedPort);
});
