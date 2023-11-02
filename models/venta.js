import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Producto from "./producto.js";
import Carrito from "./carrito.js";

const Venta = db.define(
	"Venta",
	{
		id_venta: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true,
			field: "id_venta"
		},
 		productoId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		cantidad: {
			type: DataTypes.SMALLINT,
			defaultValue: 1
		},
		subtotal: {
			type: DataTypes.FLOAT
		},
 		carritoId: {
			type: DataTypes.BIGINT,
			allowNull: false
		}
	},
	{
		timestamps: true,
		tableName: "Ventas"
	}
);

Venta.belongsTo(Producto, {
	foreignKey: "productoId",
    onDelete: 'CASCADE'
});

Producto.hasMany(Venta, {
    foreignKey: "productoId",
    onDelete: 'CASCADE'
});

Venta.belongsTo(Carrito, {
	foreignKey: "carritoId",
    onDelete: 'CASCADE'
});

Carrito.hasMany(Venta, {
    foreignKey: "carritoId",
    onDelete: 'CASCADE'
});

export default Venta;
