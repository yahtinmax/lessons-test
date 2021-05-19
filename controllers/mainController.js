const models = require("../models");
const { Sequelize, Op } = require("sequelize");
const getConfig = require("../queryConfig/getConfigQuery");
const postConfig = require("../queryConfig/postConfigQuery");

module.exports = {
  getLessons: async (dto) => {
    const valDate = await getConfig.configDate(dto.date);
    const valStatus = getConfig.configStatus(dto.status);
    const idsForTeachers = await getConfig.configTeachers(dto.teachersIds);
    const idsForStudents = await getConfig.configStudentsCount(
      dto.studentsCount
    );

    const ids = await getConfig.configIdsWhere(idsForTeachers, idsForStudents);

    const limit = dto.lessonsPerPage;
    const offset = (dto.page - 1) * limit;

    return await models.Lesson.findAll({
      attributes: [
        "id",
        "date",
        "title",
        "status",
        [
          Sequelize.literal(
            "(SELECT COUNT(visit) FROM lesson_students WHERE lesson_id = id AND visit= true)"
          ),
          "visitCount",
        ],
      ],
      include: [
        {
          model: models.Student,
          as: "students",
          through: {
            attributes: [],
          },
          attributes: [
            "id",
            "name",
            [
              Sequelize.literal(
                "(SELECT (visit) FROM lesson_students WHERE student_id = students.id AND lesson_id = lesson.id)"
              ),
              "visit",
            ],
          ],
        },
        {
          model: models.Teacher,
          as: "teachers",
          through: {
            attributes: [],
          },
        },
      ],
      where: {
        date: valDate,
        status: valStatus,
        id: ids,
      },
      order: [["id", "ASC"]],
      offset: offset,
      limit: limit,
    });
  },

  createLessons: async (dto) => {
    let result = [];

    const resultDates = await postConfig.postConfigDates(dto);

    for (const e of resultDates) {
      await models.Lesson.create(
        {
          date: e,
          title: dto.title,
          status: 0,
        },
        {
          returning: true,
        }
      ).then(async (res) => {
        const id = res.get().id;
        const lessTeachers = postConfig.configTeachers(id, dto.teachersIds);
        for (const lt of lessTeachers) {
          await models.LessonTeachers.create(lt);
        }
        result.push(id);
      });
    }
    return result;
  },
};
