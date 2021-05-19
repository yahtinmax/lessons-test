const sequelize = require("../db");
const Teacher = require("./teachers");
const Lesson = require("./lessons");
const { DataTypes } = require("sequelize");

const LessonTeachers = sequelize.define(
  "lesson_teacher",
  {
    lesson_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Lesson,
        key: "id",
      },
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Teacher,
        key: "id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "lesson_teachers",
  }
);

module.exports = LessonTeachers;
