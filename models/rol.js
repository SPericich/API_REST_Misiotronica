import { DataTypes } from "sequelize";
import db from "../db/connection.js";

const Rol = db.define(
	"Rol",
	{
		cod_rol: {
			type: DataTypes.SMALLINT,
			primaryKey: true,
			field: "cod_rol",
		},
		descripcion: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{ timestamps: false, tableName: "Roles" }
);

export default Rol;
