import { DataTypes } from "sequelize";
import db from "../db/connection.js";

const Estado = db.define(
	"Estado",
	{
		cod_estado: {
			type: DataTypes.SMALLINT,
			primaryKey: true,
			field: "cod_estado",
		},
		descripcion: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{ timestamps: false, tableName: "Estados" }
);

export default Estado;
