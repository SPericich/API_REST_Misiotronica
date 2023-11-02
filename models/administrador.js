import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Usuario from "./usuario.js";

const Administrador = db.define(
	"Administrador",
	{
		id_admin: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			field: "id_admin",
		},
		cuil: {
			type: DataTypes.BIGINT,
			unique: true,
			allowNull: false,
		},
	},
	{ timestamps: false, tableName: "Administradores" }
);

Administrador.belongsTo(Usuario, {
	foreignKey: "id_admin",
});

Usuario.hasOne(Administrador, {
	foreignKey: "id_admin",
});

export default Administrador;
