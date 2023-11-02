import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Usuario from "./usuario.js";

const Superadmin = db.define(
	"Superadmin",
	{
		id_superadmin: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			field: "id_superadmin",
		},
		dni: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
		},
		cuil: {
			type: DataTypes.BIGINT,
			unique: true,
			allowNull: false,
		},
		telefono: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
	},
	{ timestamps: false, tableName: "Superadministradores" }
);

Superadmin.belongsTo(Usuario, {
	foreignKey: "id_superadmin",
});

Usuario.hasOne(Superadmin, {
	foreignKey: "id_superadmin",
});

export default Superadmin;
