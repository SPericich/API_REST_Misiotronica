import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Usuario from "./usuario.js";
import Localidad from "./localidad.js";

const Cliente = db.define(
	"Cliente",
	{
		id_cliente: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			field: "id_cliente",
		},
		dni: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		apellidos: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		nombres: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		telefono: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		calle: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		numero: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		localidadId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		comentarios: {
			type: DataTypes.STRING,
		},
        compras: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
	},
	{
		timestamps: false,
		tableName: "Clientes",
	}
);

Cliente.belongsTo(Usuario, {
	foreignKey: "id_cliente",
});

Usuario.hasOne(Cliente, {
	foreignKey: "id_cliente",
});

Cliente.belongsTo(Localidad, {
    foreignKey: "localidadId",
});

Localidad.hasMany(Cliente, {
    foreignKey: "localidadId",
});


export default Cliente;
