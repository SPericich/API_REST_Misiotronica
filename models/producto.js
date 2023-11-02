import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Proveedor from "./proveedor.js";

const Producto = db.define(
	"Producto",
	{
		id_producto: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			field: "id_producto",
		},
		url_imagen: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		nom_producto: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		descripcion: {
			type: DataTypes.STRING,
			defaultValue: "Sin descripción",
		},
		precio: {
			type: DataTypes.FLOAT,
		},
		stock: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		disponible: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		activo: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		proveedorId: {
			type: DataTypes.INTEGER,
            allowNull: false,
		},
	},
	{
		timestamps: true,
		tableName: "Productos",
	}
);

Producto.belongsTo(Proveedor, {
	foreignKey: "proveedorId",
});

Proveedor.hasMany(Producto, {
    foreignKey: "proveedorId",
});

export default Producto;
