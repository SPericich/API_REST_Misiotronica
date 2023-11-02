import Usuario from "../models/usuario.js";
import Rol from "../models/rol.js";
import Proveedor from "../models/proveedor.js";
import Superadmin from "../models/superadmin.js";
import Administrador from "../models/administrador.js";
import Localidad from "../models/localidad.js";
import Departamento from "../models/departamento.js";
import Provincia from "../models/provincia.js";
import Cliente from "../models/cliente.js";
import Producto from "../models/producto.js";
import Venta from "../models/venta.js";
import Carrito from "../models/carrito.js";

//Listado simple de usuarios, requiere token (nivel 1 o 4)
//'/usuarios'
export async function getAllUsers(req, res) {
	try {
		if (req.tipo === 2 || req.tipo === 3) {
			return res
				.status(403)
				.json({ message: "Acceso prohibido para este nivel de usuario" });
		}
		let allUsers = await Usuario.findAll();

		let nomRol = await Rol.findAll();

		const datosFiltrados = allUsers.map((user) => ({
			id: user.id_usuario,
			email: user.email,
			usuario: user.usuario,
			rol: nomRol[user.rolCod],
			creado: user.createdAt,
			modificado: user.updatedAt,
			activo: user.activo,
		}));
		res.status(200).json({
			message: "Lista completa de usuarios",
			datosFiltrados,
		});
	} catch (error) {
		res.status(204).json({ message: error });
	}
}

//Buscar un usuario por id, requiere token
//'/usuarios/:id'
export async function getOneUserById(req, res) {
	try {
		if (req.tipo === 2) {
			return res
				.status(403)
				.json({ message: "Acceso prohibido para este nivel de usuario" });
		}

		let usuarioId = parseInt(req.params.id);
		let usuarioEncontrado = await Usuario.findByPk(usuarioId);

		if (!usuarioEncontrado) {
			res.status(204).json({ message: "Usuario no encontrado" });
		}
		let rol = usuarioEncontrado.rolCod;

		if (req.tipo === 3) {
			if (rol !== 2) {
				res.status(403).json({
					message: "Acceso denegado. El usuario no es un cliente",
				});
			}
			let cli = await Cliente.findByPk(usuarioId, { include: Localidad });
            let depart = await Departamento.findOne({
				where: { id_departamento: cli.Localidad.departamentoId },
			});
			let provin = await Provincia.findOne({
				where: { id_provincia: depart.provinciaId },
			});

			res.status(200).json({
				email: usuarioEncontrado.email,
				usuario: usuarioEncontrado.usuario,
				dni: cli.dni,
				nombres: cli.nombres,
				apellidos: cli.apellidos,
				telefono: cli.telefono,
				calle: cli.calle,
				numero: cli.numero,
				localidad: cli.Localidad.nombre,
                departamento: depart.nombre,
                provincia: provin.nombre,
				comentarios: cli.comentarios,
			});
		}

		if (rol === 1) {
			let admin = await Administrador.findByPk(usuarioId);
			res.status(200).json({
				rol: "Administrador",
				creado: usuarioEncontrado.createdAt,
				modificado: usuarioEncontrado.updatedAt,
				activo: usuarioEncontrado.activo,
				email: usuarioEncontrado.email,
				usuario: usuarioEncontrado.usuario,
				cuil: admin.cuil,
			});
		}
		if (rol === 2) {
			let cli = await Cliente.findByPk(usuarioId, { include: Localidad });
            let depart = await Departamento.findOne({
				where: { id_departamento: cli.Localidad.departamentoId },
			});
			let provin = await Provincia.findOne({
				where: { id_provincia: depart.provinciaId },
			});

			let comprasCliente = await Carrito.findAll({
				where: { clienteId: usuarioId, estadoCod: 2 },
				include: [
					{
						model: Venta,
						attributes: [
							"id_venta",
							"productoId",
							"cantidad",
							"subtotal",
						],
					},
				],
				attributes: ["id_carrito", "monto"],
			});

			res.status(200).json({
				rol: "Cliente",
				creado: usuarioEncontrado.createdAt,
				modificado: usuarioEncontrado.updatedAt,
				activo: usuarioEncontrado.activo,
				email: usuarioEncontrado.email,
				usuario: usuarioEncontrado.usuario,
				dni: cli.dni,
				nombres: cli.nombres,
				apellidos: cli.apellidos,
				telefono: cli.telefono,
				calle: cli.calle,
				numero: cli.numero,
				localidad: cli.Localidad.nombre,
                departamento: depart.nombre,
                provincia: provin.nombre,
				comentarios: cli.comentarios,
				compras: cli.compras,
				detalle_compras: comprasCliente,
			});
		}

		if (rol === 3) {
			let prov = await Proveedor.findByPk(usuarioId, {
				include: [
					{
						model: Producto,
						attributes: [
							"id_producto",
							"nom_producto",
							"disponible",
							"activo",
						],
					},
				],
			});

			res.status(200).json({
				rol: "Proveedor",
				creado: usuarioEncontrado.createdAt,
				modificado: usuarioEncontrado.updatedAt,
				activo: usuarioEncontrado.activo,
				email: usuarioEncontrado.email,
				usuario: usuarioEncontrado.usuario,
				cuit: prov.cuit,
				razon_social: prov.razon_social,
				productos: prov.Productos,
			});
		}
	} catch (error) {
		res.status(500).json({ message: error });
	}
}

//Listado completo de usuarios por rol, requiere token (nivel 1 o 4)
//'/roles/usuarios/:rolcod'
export async function getAllUsersByRol(req, res) {
	try {
		if (req.tipo === 2 || req.tipo === 3) {
			return res
				.status(403)
				.json({ message: "Acceso prohibido para este nivel de usuario" });
		}
		let rol = parseInt(req.params.rolcod);

		let allUsers;
		let resultMessage;
		let data;

		if (rol === 1) {
			allUsers = await Usuario.findAll({
				where: { rolCod: 1 },
				include: Administrador,
			});

			resultMessage = "Lista de administradores";
			data = allUsers.map((user) => ({
				id: user.id_usuario,
				email: user.email,
				usuario: user.usuario,
				activo: user.activo,
				cuil: user.Administrador.cuil,
			}));
		} else if (rol === 2) {
			allUsers = await Usuario.findAll({
				where: { rolCod: 2 },
				include: [
					{
						model: Cliente,
						include: [
							{
								model: Localidad,
							},
						],
					},
				],
			});

			resultMessage = "Lista de clientes";
			data = allUsers.map((user) => ({
				id: user.id_usuario,
				email: user.email,
				usuario: user.usuario,
				activo: user.activo,
				dni: user.Cliente.dni,
				nombres: user.Cliente.nombres,
				apellidos: user.Cliente.apellidos,
				telefono: user.Cliente.telefono,
				calle: user.Cliente.calle,
				numero: user.Cliente.numero,
				localidad: user.Cliente.Localidad.nombre,
				compras: user.Cliente.compras,
			}));
		} else if (rol === 3) {
			allUsers = await Usuario.findAll({
				where: { rolCod: 3 },
				include: Proveedor,
			});
			resultMessage = "Lista de proveedores";
			data = allUsers.map((user) => ({
				id: user.id_usuario,
				email: user.email,
				usuario: user.usuario,
				activo: user.activo,
				cuit: user.Proveedor.cuit,
				razon_social: user.Proveedor.razon_social,
			}));
		} else if (rol === 4) {
			allUsers = await Usuario.findAll({
				where: { rolCod: 4 },
				include: Superadmin,
			});
			resultMessage = "Lista de superadministradores";
			data = allUsers.map((user) => ({
				id: user.id_usuario,
				email: user.email,
				usuario: user.usuario,
				telefono: user.Superadmin.telefono,
				cuil: user.Superadmin.cuil,
			}));
		} else {
			return res.status(400).json({ message: "Rol no válido" });
		}
		if (!allUsers || allUsers.length === 0) {
			return res
				.status(200)
				.json({ message: "No hay usuarios con ese rol" });
		}
		res.status(200).json({ message: resultMessage, data });
	} catch (error) {
		res.status(204).json({ message: error });
	}
}

//obtener perfil propio, requiere token
//'/perfil/usuarios'
export async function getProfile(req, res) {
	try {
		if (req.tipo === 1) {
			let user = await Usuario.findByPk(req.user, {
				include: Administrador,
			});

			res.status(200).json({
				id: user.id_usuario,
				email: user.email,
				usuario: user.usuario,
				cuil: user.Administrador.cuil,
			});
		}
		if (req.tipo === 2) {
			let user = await Usuario.findByPk(req.user, {
				include: [
					{
						model: Cliente,
						include: [
							{
								model: Localidad,
							},
						],
					},
				],
			});

			let depart = await Departamento.findOne({
				where: { id_departamento: user.Cliente.Localidad.departamentoId },
			});
			let provin = await Provincia.findOne({
				where: { id_provincia: depart.provinciaId },
			});

			let comprasCliente = await Carrito.findAll({
				where: { clienteId: req.user },
				include: Venta,
			});

			res.status(200).json({
				id: user.id_usuario,
				email: user.email,
				usuario: user.usuario,
				dni: user.Cliente.dni,
				nombres: user.Cliente.nombres,
				apellidos: user.Cliente.apellidos,
				telefono: user.Cliente.telefono,
				calle: user.Cliente.calle,
				numero: user.Cliente.numero,
				comentarios: user.Cliente.comentarios,
				localidad: user.Cliente.Localidad.nombre,
				departamento: depart.nombre,
				provincia: provin.nombre,
				compras: comprasCliente,
			});
		}

		if (req.tipo === 3) {
			let user = await Usuario.findByPk(req.user, { include: Proveedor });

			let productosProveedor = await Producto.findAll({
				where: { proveedorId: req.user, activo: true },
			});

			res.status(200).json({
				email: user.email,
				usuario: user.usuario,
				cuit: user.Proveedor.cuit,
				razon_social: user.Proveedor.razon_social,
				productos: productosProveedor,
			});
		}
		if (req.tipo === 4) {
			let user = await Usuario.findByPk(req.user, {
				include: Superadmin,
			});

			res.status(200).json({
				id: user.id_usuario,
				email: user.email,
				usuario: user.usuario,
				cuil: user.Superadmin.cuil,
				telefono: user.Superadmin.telefono,
			});
		}
	} catch (error) {
		res.status(204).json({ message: error });
	}
}

//Agregar Usuario/Cliente
//Se plantea como un signup
//'/registro/cliente'
export async function addUserClient(req, res) {
	const {
		email,
		usuario,
		contraseña,
		dni,
		apellidos,
		nombres,
		telefono,
		calle,
		numero,
		localidadId,
		comentarios,
	} = req.body;

	try {
		const nuevoUsuario = await Usuario.create({
			rolCod: 2,
			email,
			usuario,
			contraseña,
		});
		await Cliente.create({
			id_cliente: nuevoUsuario.id_usuario,
			dni,
			apellidos,
			nombres,
			telefono,
			calle,
			numero,
			localidadId,
			comentarios,
			compras: 0,
		});
		res.status(201).json({
			mensaje: "Usuario creado con éxito",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al crear usuario y cliente",
		});
	}
}

//Agregar Usuario/Administrador, requiere token Superadmin
//'/registro/administrador'
export async function addUserAdmin(req, res) {
	const { email, usuario, contraseña, cuil } = req.body;
	try {
		if (req.tipo !== 4) {
			return res
				.status(403)
				.json({ message: "Acceso prohibido para este nivel de usuario" });
		}
		const nuevoUsuario = await Usuario.create({
			rolCod: 1,
			email,
			usuario,
			contraseña,
		});
		await Administrador.create({
			id_admin: nuevoUsuario.id_usuario,
			cuil,
		});
		res.status(201).json({
			mensaje: "Usuario creado con éxito",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al crear usuario y administrador",
		});
	}
}

//Agregar Usuario/Proveedor, requiere token (nivel 1 o 4)
//'/registro/proveedor'
export async function addUserProvider(req, res) {
	const { email, usuario, contraseña, cuit, razon_social } = req.body;

	try {
		if (req.tipo == 2 || req.tipo == 3) {
			return res
				.status(403)
				.json({ message: "Acceso prohibido para este nivel de usuario" });
		}

		const nuevoUsuario = await Usuario.create({
			rolCod: 3,
			email,
			usuario,
			contraseña,
		});
		await Proveedor.create({
			id_proveedor: nuevoUsuario.id_usuario,
			cuit,
			razon_social,
		});
		res.status(201).json({
			mensaje: "Usuario creado con éxito",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al crear usuario y proveedor",
		});
	}
}

//Modificar usuario y contraseña propios, requiere token
//'/cuenta/usuarios'
export async function updateProfileUser(req, res) {
	const usuarioId = req.user;
	const { contraseñaActual, nuevoUsuario, nuevaContraseña } = req.body;
	try {
		const user = await Usuario.findByPk(usuarioId);

		if (contraseñaActual !== user.contraseña) {
			return res.status(403).json({ mensaje: "Contraseña incorrecta" });
		}

		let datosActualizados = {};
		if (nuevoUsuario) datosActualizados.usuario = nuevoUsuario;
		if (nuevaContraseña) datosActualizados.contraseña = nuevaContraseña;

		await user.update(datosActualizados);

		res.json({ mensaje: "Cuenta actualizada con éxito" });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al actualizar los datos de la cuenta",
		});
	}
}

//modificar datos propios, Cliente, requiere token (nivel 2)
//'/perfil/cliente'
export async function updateProfileClient(req, res) {
	const usuarioId = req.user;
	const {
		contraseñaActual,
		dni,
		nombres,
		apellidos,
		telefono,
		calle,
		numero,
		localidadId,
		comentarios,
	} = req.body;
	try {
		if (req.tipo !== 2) {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const user = await Usuario.findByPk(usuarioId);
		const cli = await Cliente.findByPk(usuarioId);

		if (contraseñaActual !== user.contraseña) {
			return res.status(403).json({ mensaje: "Contraseña incorrecta" });
		}

		if (!cli) {
			return res.status(204).json({ mensaje: "Cliente no encontrado" });
		}

		let datosActualizados = {};
		if (dni) datosActualizados.dni = dni;
		if (nombres) datosActualizados.nombres = nombres;
		if (apellidos) datosActualizados.apellidos = apellidos;
		if (telefono) datosActualizados.telefono = telefono;
		if (calle) datosActualizados.calle = calle;
		if (numero) datosActualizados.numero = numero;
		if (localidadId) datosActualizados.localidadId = localidadId;
		if (comentarios) datosActualizados.comentarios = comentarios;

		await cli.update(datosActualizados);

		res.json({ mensaje: "Usuario actualizado con éxito" });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al actualizar el usuario",
		});
	}
}

//modificar datos propios, Proveedor, requiere token (nivel 3)
// '/perfil/proveedor'
export async function updateProfileProvider(req, res) {
	const usuarioId = req.user;
	const { cuit, razon_social } = req.body;
	try {
		if (req.tipo !== 3) {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const user = await Usuario.findByPk(usuarioId);
		const prov = await Proveedor.findByPk(usuarioId);

		if (contraseñaActual !== user.contraseña) {
			return res.status(403).json({ mensaje: "Contraseña incorrecta" });
		}

		if (!prov) {
			return res.status(204).json({ mensaje: "Proveedor no encontrado" });
		}

		let datosActualizados = {};
		if (cuit) datosActualizados.cuit = cuit;
		if (razon_social) datosActualizados.razon_social = razon_social;

		await prov.update(datosActualizados);

		res.json({ mensaje: "Usuario actualizado con éxito" });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al actualizar el usuario",
		});
	}
}

//modificar datos propios, Administrador, requiere token (nivel 1)
//'/perfil/administrador'
export async function updateProfileAdmin(req, res) {
	const usuarioId = req.user;
	const { cuil } = req.body;
	try {
		if (req.tipo !== 1) {
			return res.status(403).json({ message: "Acceso denegado" });
		}

		const user = await Usuario.findByPk(usuarioId);
		const admin = await Administrador.findByPk(usuarioId);

		if (contraseñaActual !== user.contraseña) {
			return res.status(403).json({ mensaje: "Contraseña incorrecta" });
		}

		if (!admin) {
			return res
				.status(204)
				.json({ mensaje: "Administrador no encontrado" });
		}

		let datosActualizados = {};
		if (cuil) datosActualizados.cuil = cuil;

		await admin.update(datosActualizados);

		res.json({ mensaje: "Usuario actualizado con éxito" });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al actualizar el usuario",
		});
	}
}

//Bloqueo y reactivación de un usuario, requiere token (nivel 1 y 4)
//'/estado/usuarios/:id'
export async function stateUserById(req, res) {
	const usuarioId = parseInt(req.params.id);
	const { activo } = req.body;

	try {
		if (req.tipo === 2 || req.tipo === 3) {
			return res
				.status(403)
				.json({ message: "Acceso prohibido para este nivel de usuario" });
		}

		const user = await Usuario.findByPk(usuarioId);

		if (!user) {
			return res.status(204).json({ mensaje: "Usuario no encontrado" });
		}

		//los administradores no pueden bloquear a otros
		//administradores o al superadmin
		if (req.tipo === 1) {
			if (user.rolCod === 1 || user.rolCod === 4) {
				return res.status(403).json({ message: "Acceso denegado" });
			}
		}

		await user.update({ activo: activo });

		//si el usuario a bloquear/eliminar es un proveedor,
		//bloqueo también todos sus productos y los saco
		//de carritos pendientes
		if (user.rolCod === 3) {
			const prov = await Proveedor.findByPk(usuarioId);
			const productosProveedor = await Producto.findAll({
				where: { proveedorId: prov.id_proveedor },
			});
			const carritosPendientes = await Carrito.findAll({
				where: { estadoCod: 1 },
				include: [
					{
						model: Venta,
						include: [
							{
								model: Producto,
								where: { proveedorId: prov.id_proveedor },
							},
						],
					},
				],
			});

			if (activo === false) {
				for (const producto of productosProveedor) {
					await producto.update({ activo: false });
				}
				for (const carrito of carritosPendientes) {
					const ventasProveedor = carrito.Venta.filter(
						(venta) => venta.Producto
					);
					for (const venta of ventasProveedor) {
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
			} else {
				for (const producto of productosProveedor) {
					await producto.update({ activo: true });
				}
			}
		}

		//si el usuario a bloquear/eliminar es un cliente,
		//elimino sus carritos pendientes y actualizo el stock
		//de los productos que pretendían comprar
		if (user.rolCod === 2) {
			const cli = await Cliente.findByPk(usuarioId);
			let cart = await Carrito.findOne({
				where: { clienteId: cli.id_cliente, estadoCod: 1 },
				attributes: ["id_carrito"],
			});

			if (cart) {
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
						}
					}

					await Venta.destroy({ where: { carritoId: cart.id_carrito } });
				}

				await Carrito.destroy({ where: { id_carrito: cart.id_carrito } });
			}
		}

		res.json({ mensaje: "Estado actualizado con éxito" });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			mensaje: "Error al actualizar el usuario",
		});
	}
}
