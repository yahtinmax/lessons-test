const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Student = sequelize.define(
  "student",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.CHAR(10),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "students",
  }
);

module.exports = Student;
