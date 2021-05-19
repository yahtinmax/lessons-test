const models = require("../models");
const { Sequelize, Op } = require("sequelize");
const boom = require("boom");

module.exports = {
  configDate: async (date) => {
    const regExp = /^\d{4}-((0\d)|(1[012]))-(([012]\d)|3[01])$/;
    if (!date) {
      const maxDate = await models.Lesson.max("date");
      return {
        [Op.lte]: maxDate,
      };
    } else if (
      date.length === 2 &&
      date[0].match(regExp) &&
      date[1].match(regExp)
    ) {
      return {
        [Op.between]: [new Date(date[0]), new Date(date[1])],
      };
    } else if (date.length === 1 && date[0].match(regExp)) {
      return {
        [Op.eq]: new Date(date[0]),
      };
    } else {
      throw boom.badRequest("Incorrect date input data");
    }
  },

  configStatus: (status) => {
    if (!status) {
      return {
        [Op.between]: [0, 1],
      };
    } else if (status == 0 || status == 1) {
      return {
        [Op.eq]: status,
      };
    } else {
      throw boom.badRequest("Incorrect status input data");
    }
  },

  configTeachers: async (teachersIds) => {
    if (!teachersIds) {
      return null;
    }

    teachersIds.map((elem, index) => {
      if (isNaN(elem)) throw boom.badRequest("Incorrect teachersId input data");
      else teachersIds[index] = Number(elem);
    });

    let data = [];
    await models.Lesson.findAll({
      raw: true,
      attributes: ["id"],
      include: [
        {
          model: models.Teacher,
          as: "teachers",
          attributes: [],
          through: {
            attributes: [],
          },
          where: {
            id: {
              [Op.in]: teachersIds,
            },
          },
        },
      ],
    }).then((ids) => {
      ids.forEach((e) => data.push(e.id));
    });

    return data;
  },

  configIdsWhere: async (teachers, students) => {
    if (!teachers && !students) {
      const max = await models.Lesson.max("id");
      return {
        [Op.between]: [0, max],
      };
    } else if (!teachers) {
      return {
        [Op.in]: students,
      };
    } else if (!students) {
      return {
        [Op.in]: teachers,
      };
    } else if (teachers && students) {
      const newIdsArray = teachers.filter((i) => students.includes(i));
      return {
        [Op.in]: newIdsArray,
      };
    }
  },

  configStudentsCount: async (studentsCount) => {
    let data = [];
    await models.Lesson.findAll({
      raw: true,
      attributes: [
        "id",
        [
          Sequelize.literal(
            `(SELECT COUNT(student_id) FROM lesson_students WHERE lesson_id = lesson.id)`
          ),
          "count",
        ],
      ],
    }).then((e) => {
      data = removeDuplicates(e);
    });
    return await studCountHelp(studentsCount, data);
  },
};

async function studCountHelp(e, data) {
  const result = [];
  if (!e) {
    return null;
  } else if (e.length === 2 && !isNaN(e[0]) && !isNaN(e[1])) {
    data.forEach((elem) => {
      if (elem.count >= e[0] && elem.count <= e[1]) {
        result.push(elem.id);
      }
    });
    return result;
  } else if (e.length === 1 && !isNaN(e[0])) {
    data.forEach((elem) => {
      if (elem.count === e[0]) {
        result.push(elem.id);
      }
    });
    return result;
  } else {
    throw boom.badRequest("Incorrect type of studentsCount data");
  }
}

function removeDuplicates(arr) {
  const result = [];
  const duplicatesIndices = [];

  arr.forEach((current, index) => {
    if (duplicatesIndices.includes(index)) return;

    result.push(current);

    for (
      let comparisonIndex = index + 1;
      comparisonIndex < arr.length;
      comparisonIndex++
    ) {
      const comparison = arr[comparisonIndex];
      const currentKeys = Object.keys(current);
      const comparisonKeys = Object.keys(comparison);

      if (currentKeys.length !== comparisonKeys.length) continue;

      const currentKeysString = currentKeys.sort().join("").toLowerCase();
      const comparisonKeysString = comparisonKeys.sort().join("").toLowerCase();
      if (currentKeysString !== comparisonKeysString) continue;

      let valuesEqual = true;
      for (let i = 0; i < currentKeys.length; i++) {
        const key = currentKeys[i];
        if (current[key] !== comparison[key]) {
          valuesEqual = false;
          break;
        }
      }
      if (valuesEqual) duplicatesIndices.push(comparisonIndex);
    }
  });
  return result;
}
