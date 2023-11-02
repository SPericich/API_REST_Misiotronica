import Producto from "../models/producto.js";
import Proveedor from "../models/proveedor.js";
import Carrito from "../models/carrito.js";
import Venta from "../models/venta.js";

//Listar todos los productos
//'/productos'
export async function getAllProducts(req, res) {
	try {
		let allProducts = await Producto.findAll({
			include: [
				{
					model: Proveedor,
					attributes: ["razon_social"],
				},
			],
			order: [["id_producto", "ASC"]],
		});

		const listaFiltrados = allProducts
			.filter((product) => product.activo === true)
			.map((product) => ({
				id: product.id_producto,
				nombre: product.nom_producto,
				descripcion: product.descripcion,
				precio: product.precio,
				stock: product.stock,
				disponible: product.disponible,
				proveedor: product.Proveedor.razon_social,
			}));

		res.status(200).json(listaFiltrados);
	} catch (error) {
		res.status(204).json({ message: error });
	}
}

//Buscar un producto por id
//'/productos/:id'
export async function getProductById(req, res) {
	try {
		let productoId = parseInt(req.params.id);
		let productoEncontrado = await Producto.findByPk(productoId, {
			include: [
				{
					model: Proveedor,
					attributes: ["razon_social"],
				},
			],
		});

		if (!productoEncontrado) {
			res.status(204).json({ message: "Producto no encontrado" });
		}

		if (productoEncontrado.activo === false) {
			res.status(204).json({
				message: "El producto no está disponible por el momento",
			});
		}

		let datosFiltrados = {
			nombre: productoEncontrado.nom_producto,
			descripcion: productoEncontrado.descripcion,
			precio: productoEncontrado.precio,
			stock: productoEncontrado.stock,
			disponible: productoEncontrado.disponible,
			proveedor: productoEncontrado.Proveedor.razon_social,
		};

		res.status(200).json(datosFiltrados);
	} catch (error) {
		res.status(204).json({ message: error });
	}
}

//Agregar producto, requiere token (nivel 3)
//'/proveedor/productos'
export async function addNewProduct(req, res) {
	const { url_imagen, nom_producto, descripcion, precio, stock } = req.body;
	try {
		if (req.tipo !== 3) {
			return res
				.status(403)
				.json({ message: "Acceso prohibido para este nivel de usuario" });
		}
		if (stock < 0) {
			return res
				.status(400)
				.json({ message: "El stock no puede ser un número negativo" });
		}
		if (precio < 0) {
			return res
				.status(400)
				.json({ message: "El precio no puede ser un número negativo" });
		}

		await Producto.create({
			url_imagen,
			nom_producto,
			descripcion,
			precio,
			stock,
			proveedorId: req.user,
		});

		res.status(201).json({
			mensaje: "Producto creado con éxito",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al crear producto",
		});
	}
}

//Modificar datos de un producto, requiere token (nivel 3)
//'/datos/productos/:id'
export async function updateProductById(req, res) {
	const productoId = parseInt(req.params.id);
	const { url_imagen, nom_producto, descripcion, precio, stock, disponible } =
		req.body;
	try {
		if (req.tipo !== 3) {
			return res
				.status(403)
				.json({ message: "Acceso prohibido para este nivel de usuario" });
		}
		if (stock < 0) {
			return res
				.status(400)
				.json({ message: "El stock no puede ser un número negativo" });
		}
		if (precio < 0) {
			return res
				.status(400)
				.json({ message: "El precio no puede ser un número negativo" });
		}

		const producto = await Producto.findByPk(productoId);

		if (!producto) {
			return res.status(204).json({ mensaje: "Producto no encontrado" });
		}

		if (producto.proveedorId !== req.user) {
			return res
				.status(403)
				.json({ message: "No puede modificar este producto" });
		}

		let datosActualizados = {};
		if (url_imagen) datosActualizados.url_imagen = url_imagen;
		if (nom_producto) datosActualizados.nom_producto = nom_producto;
		if (descripcion) datosActualizados.descripcion = descripcion;
		if (precio) datosActualizados.precio = precio;
		if (stock) datosActualizados.stock = stock;
		if (disponible) datosActualizados.disponible = disponible;

		await producto.update(datosActualizados);

		res.json({ mensaje: "Producto actualizado con éxito" });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al actualizar el producto",
		});
	}
}

//Desactivar producto, requiere token (nivel 1)
//'/estado/productos/:id'
export async function stateProductById(req, res) {
	try {
		const productoId = parseInt(req.params.id);
		const { activo } = req.body;

		if (req.tipo === 2 || req.tipo === 3) {
			return res
				.status(403)
				.json({ message: "Acceso prohibido para este nivel de usuario" });
		}

		const producto = await Producto.findByPk(productoId);

		if (!producto) {
			return res.status(204).json({ mensaje: "Producto no encontrado" });
		}

		if (activo === false) {
			//veo si el producto está en algún carrito activo(pendiente)
			const carritosPendientes = await Carrito.findAll({
				where: { estadoCod: 1 },
				include: [
					{
						model: Venta,
						include: [
							{
								model: Producto,
								where: { id_producto: productoId },
							},
						],
					},
				],
			});
			for (const carrito of carritosPendientes) {
				const ventasProducto = carrito.Venta.filter(
					(venta) => venta.Producto.id_producto === productoId
				);
				//elimino las ventas pendientes que contengan el producto
				//que estoy desactivando
				for (const venta of ventasProducto) {
					const montoARestar = venta.subtotal;
					await Venta.destroy({ where: { id_venta: venta.id_venta } });
					const nuevoMonto = carrito.monto - montoARestar;
					await Carrito.update(
						{ monto: nuevoMonto },
						{ where: { id_carrito: carrito.id_carrito } }
					);
					const cantidadVentas = await Venta.count({
						where: {
							id_carrito: carrito.id_carrito,
						},
					});
					if (cantidadVentas === 0) {
						await Carrito.destroy({
							where: { id_carrito: carrito.id_carrito },
						});
					}
				}
			}
		}
		await producto.update({ activo: activo });

		res.json({ mensaje: "Producto actualizado con éxito" });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al actualizar el producto",
		});
	}
}
