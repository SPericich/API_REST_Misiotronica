import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Provincia from "./provincia.js";

const Departamento = db.define(
	"Departamento",
	{
		id_departamento: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			field: "id_departamento",
		},
		nombre: {
			type: DataTypes.STRING,
			allowNull: false,
		},
        provinciaId: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        }
	},
	{ timestamps: false, tableName: "Departamentos" }
);

Departamento.belongsTo(Provincia, {
	foreignKey: "provinciaId",
});

Provincia.hasMany(Departamento, {
    foreignKey: "provinciaId",
});

export default Departamento;