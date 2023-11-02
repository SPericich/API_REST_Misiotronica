import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Cliente from "./cliente.js";
import Estado from "./estado.js";

const Carrito = db.define(
	"Carrito",
	{
		id_carrito: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
			field: "id_carrito",
		},
		monto: {
			type: DataTypes.FLOAT,
		},
		estadoCod: {
			type: DataTypes.SMALLINT,
			allowNull: false,
			defaultValue: 1,
		},
		clienteId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		timestamps: false,
		tableName: "Carritos",
	}
);

Carrito.belongsTo(Cliente, {
	foreignKey: "clienteId",
});

Cliente.hasMany(Carrito, {
    foreignKey: "clienteId",
});

Carrito.belongsTo(Estado, {
	foreignKey: "estadoCod",
});

Estado.hasMany(Carrito, {
    foreignKey: "estadoCod",
});

export default Carrito;
