const sequelize = require("../db");
const Lesson = require("./lessons");
const Student = require("./student");
const { DataTypes } = require("sequelize");

const LessonStudents = sequelize.define(
  "lesson_students",
  {
    lesson_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Lesson,
        primaryKey: "id",
      },
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Student,
        primaryKey: "id",
      },
    },
    visit: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        name: "idx_lesson",
        fields: ["lesson_id"],
      },
      {
        name: "idx_student",
        fields: ["student_id"],
      },
      {
        name: "idx_visit",
        fields: ["visit"],
      },
    ],
    timestamps: false,
    tableName: "lesson_students",
  }
);

module.exports = LessonStudents;
