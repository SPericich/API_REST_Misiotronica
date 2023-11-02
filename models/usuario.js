import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Rol from "./rol.js";

const Usuario = db.define(
	"Usuario",
	{
		id_usuario: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			field: "id_usuario",
		},
		rolCod: {
			type: DataTypes.SMALLINT,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		usuario: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		contraseña: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		activo: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		timestamps: true,
		tableName: "Usuarios",
	}
);

Usuario.belongsTo(Rol, {
	foreignKey: "rolCod",
});

Rol.hasMany(Usuario, {
    foreignKey: "rolCod",
});

export default Usuario;
