import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.js";

async function authentication(req, res) {
	const usuarioABuscar = req.body.usuario;
	const password = req.body.contraseña;
	let usuarioEncontrado = "";
	try {
		usuarioEncontrado = await Usuario.findAll({
			where: { usuario: usuarioABuscar },
		});

		if (usuarioEncontrado == "") {
			return res.status(400).json({ messagge: "Usuario no encontrado" });
		}
	} catch {
		return res.status(400).json({ message: "Usuario no encontrado" });
	}

	if (usuarioEncontrado[0].contraseña !== password) {
		return res.status(400).json({ message: "Contraseña incorrecta" });
	}

	if (usuarioEncontrado[0].activo !== true) {
		return res.status(400).json({ message: "Usuario bloqueado" });
	}
	const sub = usuarioEncontrado[0].id_usuario;
	const user = usuarioEncontrado[0].usuario;
	const rol = usuarioEncontrado[0].rolCod;

	const token = jwt.sign(
		{
			sub,
			user,
			rol,
			exp: Date.now() + 3600 * 1000,
		},
		process.env.SECRET_KEY
	);
	res.status(200).json({ accessToken: token });
};

export default authentication