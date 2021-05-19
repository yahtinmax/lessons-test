const sequelize = require("../db");
const { DataTypes } = require("sequelize");
const Teacher = require("./teachers"),
  Student = require("./student"),
  LessonStudents = require("./lesson-students"),
  LessonTeachers = require("./lesson-teachers");

const Lesson = sequelize.define(
  "lesson",
  {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    title: {
      type: DataTypes.CHAR(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        name: "idx_date",
        fields: ["date"],
      },
      {
        name: "idx_status",
        fields: ["status"],
      },
    ],
    timestamps: false,
    tableName: "lessons",
  }
);

Lesson.belongsToMany(Student, {
  through: LessonStudents,
  foreignKey: "lesson_id",
  otherKey: "student_id",
  as: "students",
  timestamps: false,
});
Student.belongsToMany(Lesson, {
  as: "lessons",
  foreignKey: "student_id",
  otherKey: "lesson_id",
  through: LessonStudents,
  timestamps: false,
});

Lesson.belongsToMany(Teacher, {
  as: "teachers",
  through: LessonTeachers,
  foreignKey: "lesson_id",
  otherKey: "teacher_id",
  timestamps: false,
});
Teacher.belongsToMany(Lesson, {
  as: "lessons",
  through: LessonTeachers,
  foreignKey: "teacher_id",
  otherKey: "lesson_id",
  timestamps: false,
});

module.exports = Lesson;
