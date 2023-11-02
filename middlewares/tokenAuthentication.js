import jwt from "jsonwebtoken";


function tokenAuthentication(req, res, next) {
	const headerAuthorization = req.headers["authorization"];
	const tokenRecibido = headerAuthorization.split(" ")[1];
	if (tokenRecibido == null) {
		return res.status(401).json({ message: "Token inválido" });
	}
	let payload = null;
	try {
		payload = jwt.verify(tokenRecibido, process.env.SECRET_KEY);
	} catch (error) {
		return res.status(401).json({ message: "Token inválido" });
	}
	if (Date.now() > payload.exp) {
		return res.status(401).json({ message: "Token caducado" });
	}

	req.user = payload.sub;
	req.tipo = payload.rol;
	next();
}

export default tokenAuthentication