import Cliente from "../models/cliente.js";
import Producto from "../models/producto.js";
import Venta from "../models/venta.js";
import Carrito from "../models/carrito.js";

//agregar producto al carrito - requiere token (nivel 2)
//'/cliente/venta'
export async function addProductToCart(req, res) {
	const { estado, productoId, cantidad } = req.body;
	try {
		if (req.tipo !== 2) {
			return res.status(403).json({
				message: "Debe estar registrado como cliente para poder comprar",
			});
		}
		if (estado !== 1 && estado !== 2) {
			res.status(201).json({
				mensaje: "El código de estado debe ser 1 o 2",
			});
		}
		const cli = await Cliente.findByPk(req.user, {
			attributes: ["id_cliente", "compras"],
		});
		const prod = await Producto.findByPk(productoId, {
			attributes: ["id_producto", "precio", "stock"],
		});
		if (!prod) {
			res.status(201).json({
				mensaje: "Producto no encontrado",
			});
		}
		if (prod.stock < cantidad) {
			return res.status(201).json({
				mensaje: "No hay suficiente stock",
			});
		}
		if (prod.estado === false) {
			res.status(201).json({
				mensaje: "Producto no disponible",
			});
		}
		let subt = prod.precio * cantidad;
        //busco el carrito activo - estado 1 (pendiente)
		const carritoActual = await Carrito.findOne({
			where: { clienteId: req.user, estadoCod: 1 },
			include: Venta,
		});

		let ventaExistente;
		let idCart;

		if (carritoActual) {
			idCart = carritoActual.id_carrito;
			let mon = carritoActual.monto + subt;
            //veo si el producto ya está en el carrito
			ventaExistente = carritoActual.Venta.find(
				(venta) => venta.productoId === productoId
			);
            //si está, le agrego la nueva cantidad
			if (ventaExistente) {
				let nuevaCantidad = ventaExistente.cantidad + cantidad;
				let nuevoSubtotal = ventaExistente.subtotal + subt;
				await ventaExistente.update({
					cantidad: nuevaCantidad,
					subtotal: nuevoSubtotal,
				});
			} else { //y si no está, lo asigno a una nueva venta
				await Venta.create({
					productoId,
					cantidad,
					subtotal: subt,
					carritoId: carritoActual.id_carrito,
				});
			}

			await carritoActual.update({ monto: mon, estadoCod: estado });
		}
		if (!carritoActual) { //si no hay carrito activo, creo uno
			const nuevoCarrito = await Carrito.create({
				monto: subt,
				estadoCod: estado,
				clienteId: req.user,
			});
			await Venta.create({ //y le asigno la nueva venta
				productoId,
				cantidad,
				subtotal: subt,
				carritoId: nuevoCarrito.id_carrito,
			});
			idCart = nuevoCarrito.id_carrito;
		}

        //si el carrito se cierra, se cuentan los items para actualizar
        //el contador de compras del cliente
        //cerrar el carrito - estado2 (completado) - simboliza la efectivización
        //de la compra
		if (estado === 2) {
			const cantidadVentas = await Venta.count({
				where: {
					carritoId: idCart,
				},
			});

			let com = cli.compras + cantidadVentas;

			await cli.update(
				{ compras: com },
				{
					where: { id_cliente: req.user },
				}
			);
		}
        //actualizo el stock del producto y si queda en 0
        //cambio el valor de su campo 'disponible'
		let resto = prod.stock - cantidad;
		await prod.update(
			{ stock: resto },
			{
				where: { id_producto: productoId },
			}
		);
		if (resto === 0) {
			await prod.update(
				{ disponible: false },
				{
					where: { id_producto: productoId },
				}
			);
		}
		res.status(201).json({
			mensaje: "Producto agregado al carrito",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al agregar producto al carrito",
		});
	}
}

//ver carrito actual - requiere token (nivel 2)
//"/carrito"
export async function getCart(req, res) {
	try {
		if (req.tipo !== 2) {
			return res.status(403).json({
				message:
					"Debe estar registrado como cliente para acceder al carrito",
			});
		}
        //busco el carrito activo - estado 1 (pendiente)
		let cart = await Carrito.findOne({
			where: { clienteId: req.user, estadoCod: 1 },
			include: [
				{
					model: Venta,
					attributes: ["id_venta", "productoId", "cantidad", "subtotal"],
				},
			],
			attributes: ["id_carrito", "monto"],
		});

		if (!cart) {
			return res.status(201).json({
				mensaje: "No hay carritos pendientes",
			});
		}

		const carritoPendiente = {
			id_carrito: cart.id_carrito,
			monto: cart.monto,
			Items: cart.Venta,
		};

		res.status(200).json({
			carrito_actual: carritoPendiente,
		});
	} catch (error) {
		res.status(204).json({ message: error });
	}
}

//historial de compras, requiere token (nivel 2)
//'/cliente/miscompras'
export async function cartHistory(req, res) {
	try {
		if (req.tipo !== 2) {
			return res.status(403).json({
				message:
					"Debe estar registrado como cliente para acceder al historial de compras",
			});
		}
        //busco todos los carritos con estado 2 (completado)
        //el estado 2 simboliza la efectivización de la compra
		let cart = await Carrito.findAll({
			where: { clienteId: req.user, estadoCod: 2 },
			include: [
				{
					model: Venta,
					attributes: ["id_venta", "productoId", "cantidad", "subtotal"],
				},
			],
			attributes: ["id_carrito", "monto"],
		});

		const historialCarritos = cart.map((car) => ({
			id_carrito: car.id_carrito,
			monto: car.monto,
			Items: car.Venta,
		}));

		res.status(200).json({
			historial_compras: historialCarritos,
		});
	} catch (error) {
		res.status(204).json({ message: error });
	}
}

//eliminar un producto del carrito, requere token (nivel 2)
//'/cliente/carrito/eliminarventa'
export async function deleteSale(req, res) {
	const { productoId } = req.body;
	try {
		if (req.tipo !== 2) {
			return res.status(403).json({
				message:
					"Debe estar registrado como cliente para acceder al carrito",
			});
		}
        //busco el carrito activo - estado 1 (pendiente) -
		let cart = await Carrito.findOne({
			where: { clienteId: req.user, estadoCod: 1 },
			include: [
				{
					model: Venta,
					attributes: ["id_venta", "productoId", "cantidad", "subtotal"],
				},
			],
			attributes: ["id_carrito", "monto"],
		});

		if (!cart) {
			return res.status(204).json({
				message: "No existe un carrito activo",
			});
		}
        //busco una venta asociada al producto que quiero eliminar
		const venta = cart.Venta.find((venta) => venta.productoId === productoId);
		if (!venta) {
			return res.status(404).json({
				message: "Producto no encontrado en el carrito",
			});
		}

		let cantidadProducto = venta.cantidad;
		let montoARestar = venta.subtotal;
		const prod = await Producto.findByPk(productoId);

		await Venta.destroy({ where: { id_venta: venta.id_venta } });
		let nuevoMonto = cart.monto - montoARestar;
		let nuevoStock = prod.stock + cantidadProducto;
		await cart.update({ monto: nuevoMonto });
		await prod.update({ stock: nuevoStock });
		//consulto si el carrito sigue teniendo ventas
		const cantidadVentas = await Venta.count({
			where: {
				carritoId: cart.id_carrito,
			},
		});
		if ((cantidadVentas === 0)) {
			await Carrito.destroy({ where: { id_carrito: cart.id_carrito } });
		}

		res.status(200).json({ message: "Carrito modificado" });
	} catch (error) {
		res.status(500).json({
			message: "Error al intentar modificar el carrito",
		});
	}
}

//modificar la cantidad de un producto que está en el carrito
//'/cliente/carrito/modificarventa'
export async function updateSale(req, res) {
	const { productoId, nuevaCantidad } = req.body;
	try {
		if (req.tipo !== 2) {
			return res.status(403).json({
				message:
					"Debe estar registrado como cliente para acceder al carrito",
			});
		}
		if (nuevaCantidad < 0) {
			return res.status(204).json({
				message: "La cantidad no puede ser negativa",
			});
		}
        //busco el carrito activo - estado 1 (pendiente)
		let cart = await Carrito.findOne({
			where: { clienteId: req.user, estadoCod: 1 },
			include: [
				{
					model: Venta,
					attributes: ["id_venta", "productoId", "cantidad", "subtotal"],
				},
			],
			attributes: ["id_carrito", "monto"],
		});

		if (!cart) {
			return res.status(204).json({
				message: "No existe un carrito activo",
			});
		}
        //veo si el producto que quiere modificarse está en el carrito
		const venta = cart.Venta.find((venta) => venta.productoId === productoId);
		if (!venta) {
			return res.status(404).json({
				message: "Producto no encontrado en el carrito",
			});
		}
		let cantidadProducto = venta.cantidad;
		const prod = await Producto.findByPk(productoId);
		let stockProvisorio = prod.stock + cantidadProducto;
		if (stockProvisorio < nuevaCantidad) {
			return res.status(404).json({
				message: "No hay suficiente stock",
			});
		}
		let nuevoStock = prod.stock + (cantidadProducto - nuevaCantidad);
		let nuevoSubtotal = 0;
         //si la nueva cantidad es cero, se entiende que se quiere eliminar 
         //el producto del carrito
		if (nuevaCantidad === 0) {
			let montoARestar = venta.subtotal;
			await Venta.destroy({ where: { id_venta: venta.id_venta } });
			cart.monto = cart.monto - montoARestar;
		} else {
			nuevoSubtotal = nuevaCantidad * prod.precio;
			await venta.update(
				{
					cantidad: nuevaCantidad,
					subtotal: nuevoSubtotal,
				},
				{ where: { id_venta: venta.id_venta } }
			);
			cart.monto = cart.Venta.reduce(
				(total, venta) => total + venta.subtotal,
				0
			);
		}

		await prod.update({ stock: nuevoStock });
        //veo cuántas ventas tiene el carrito, por si se eliminó la venta
		const cantidadVentas = await Venta.count({
			where: {
				carritoId: cart.id_carrito,
			},
		});
		if (cantidadVentas === 0) {
			await cart.destroy({ where: { id_carrito: cart.id_carrito } });
		} else {
			await cart.save();
		}
		res.status(200).json({ message: "Carrito modificado" });
	} catch (error) {
		res.status(500).json({
			message: "Error al intentar modificar el carrito",
		});
	}
}

//eliminar el carrito activo
//'/cliente/carrito/eliminarcarrito'
export async function deleteCart(req, res) {
	try {
		if (req.tipo !== 2) {
			return res.status(403).json({
				message:
					"Debe estar registrado como cliente para acceder al carrito",
			});
		}
        //veo si existe un carrito activo - estado 1 (pendiente)
		let cart = await Carrito.findOne({
			where: { clienteId: req.user, estadoCod: 1 },
			attributes: ["id_carrito", "monto"],
		});

		if (!cart) {
			return res.status(204).json({
				message: "No existe un carrito activo",
			});
		}
        //recupero las ventas del carrito activo
        //modifico el stock de todos los productos pertencientes
        //a esas ventas, y después las elimino y elimino el carrito
		const ventas = await Venta.findAll({
			where: { carritoId: cart.id_carrito },
			attributes: ["productoId", "cantidad"],
		});

		if (ventas) {
			for (const venta of ventas) {
				const prod = await Producto.findByPk(venta.productoId);
				if (prod) {
					const nuevoStock = prod.stock + venta.cantidad;
					await prod.update({ stock: nuevoStock });
				} else {
					console.log("Producto no encontrado");
				}
			}

			await Venta.destroy({ where: { carritoId: cart.id_carrito } });
		}

		await Carrito.destroy({ where: { id_carrito: cart.id_carrito } });

		res.status(200).json({ message: "Carrito eliminado" });
	} catch (error) {
		res.status(500).json({
			message: "Error al intentar modificar el carrito",
		});
	}
}
