import { DataTypes } from "sequelize";
import db from "../db/connection.js";
import Departamento from "./departamento.js";

const Localidad = db.define(
	"Localidad",
	{
		id_localidad: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			field: "id_localidad",
		},
		nombre: {
			type: DataTypes.STRING,
			allowNull: false,
		},
        departamentoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
	},
	{ timestamps: false, tableName: "Localidades" }
);

Localidad.belongsTo(Departamento, {
	foreignKey: "departamentoId",
});

Departamento.hasMany(Localidad, {
    foreignKey: "departamentoId",
});

export default Localidad;