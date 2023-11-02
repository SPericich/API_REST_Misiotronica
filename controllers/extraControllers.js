import Estado from "../models/estado.js"
import Rol from "../models/rol.js"

//Crear roles
//'/roles'
export async function createRoles(req,res){
    const { cod_rol, descripcion } = req.body;
    if (req.tipo !== 4){
        res.status(403).json({
            mensaje: "Acceso denegado",
        });
    }
	await Rol.create({
		cod_rol,
		descripcion,
	});
	res.status(201).json({
		mensaje: "Rol creado con éxito",
	});
}

//Crear estados
//'/estados'
export async function createEstados(req,res){
    const { cod_estado, descripcion } = req.body;
    if (req.tipo !== 4){
        res.status(403).json({
            mensaje: "Acceso denegado",
        });
    }
	await Estado.create({
		cod_estado,
		descripcion,
	});
	res.status(201).json({
		mensaje: "Estado creado con éxito",
	});
}




