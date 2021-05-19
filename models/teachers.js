const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Teacher = sequelize.define(
  "teacher",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.CHAR(10),
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "teachers",
  }
);

module.exports = Teacher;
