import { DataTypes } from "sequelize";
import db from "../db/connection.js";

const Provincia = db.define(
	"Provincia",
	{
		id_provincia: {
			type: DataTypes.SMALLINT,
			primaryKey: true,
			field: "id_provincia",
		},
		nombre: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{ timestamps: false, tableName: "Provincias" }
);

export default Provincia;

