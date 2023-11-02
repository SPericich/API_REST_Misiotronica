import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Usuario from "./usuario.js";

const Proveedor = db.define(
	"Proveedor",
	{
		id_proveedor: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			field: "id_proveedor",
		},
		cuit: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		razon_social: {
			type: DataTypes.STRING,
		},
	},
	{
		timestamps: false,
		tableName: "Proveedores",
	}
);

Proveedor.belongsTo(Usuario, {
	foreignKey: "id_proveedor",
});

Usuario.hasOne(Proveedor, {
	foreignKey: "id_proveedor",
});

export default Proveedor;
