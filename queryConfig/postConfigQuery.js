const boom = require("boom");
const dateFns = require("date-fns");
const models = require("../models");

module.exports = {
  postConfigDates: async (dto) => {
    await validateDto(dto);

    const fromDate = new Date(dto.firstDate);
    const toDate = new Date(dto.lastDate);

    if (dto.firstDate && dto.lastDate && dto.lessonsCount) {
      throw boom.badRequest(
        "Invalid input data. Use conditions: firstDate && lessonsCount or firstDate && lastDate"
      );
    } else if (dto.firstDate && dto.lastDate) {
      const dayDiff = dateFns.intervalToDuration({
        start: fromDate,
        end: toDate,
      });
      if (dayDiff.years > 0) {
        throw boom.badRequest("Invalid lessons period. Limit: 1 year");
      }
      return getResultDates(fromDate, toDate, dto.days);
    } else if (dto.firstDate && dto.lessonsCount) {
      if (isNaN(dto.lessonsCount)) {
        throw boom.badRequest("Invalid type of lessonsCount");
      }
      if (dto.lessonsCount < dto.days.length) {
        throw boom.badRequest("lessonsCount should be gte days array length");
      }
      const weeksCount = Math.ceil(dto.lessonsCount / dto.days.length);
      const lastDay = dateFns.addWeeks(fromDate, weeksCount);

      return getResultDates(fromDate, lastDay, dto.days, dto.lessonsCount);
    } else {
      throw boom.badRequest("Invalid lastDate");
    }
  },

  configTeachers: (id, teachers) => {
    const result = [];
    teachers.forEach((e) => {
      result.push({ lesson_id: id, teacher_id: e });
    });
    return result;
  },
};

function getResultDates(fromDate, toDate, days, count) {
  const result = [];
  let limit = 0;
  const dates = dateFns.eachDayOfInterval({
    start: fromDate,
    end: toDate,
  });

  dates.forEach((date) => {
    const diff = dateFns.intervalToDuration({ start: dates[0], end: date });
    if (diff.years !== 0 || limit === 300 || limit === count) return;
    if (days.includes(dateFns.getDay(date))) {
      result.push(dateFns.format(date, "yyyy-MM-dd"));
      limit++;
    }
  });
  if (result.length === 0) {
    throw boom.badRequest("Nothing to add");
  }
  return result;
}

async function validateDto(dto) {
  if (dto.lessonsCount > 300) {
    throw boom.badRequest("Invalid lessons count. Limit: 300");
  }

  if (!dto.days || dto.days.length === 0) {
    throw boom.badRequest("Invalid days array input data");
  }

  if (!dto.title) {
    throw boom.badRequest("Invalid title");
  }

  if (!dto.firstDate) {
    throw boom.badRequest("Invalid firstDate");
  }

  if (Array.isArray(dto.teachersIds)) {
    for (let id of dto.teachersIds) {
      if (isNaN(id)) {
        throw boom.badRequest("Invalid type of teacher id");
      }
      const teacher = await models.Teacher.findOne({
        where: {
          id: id,
        },
      });
      if (!teacher) {
        throw boom.badRequest(`Teacher with id ${id} doesn't exist`);
      }
    }
  } else {
    throw boom.badRequest(`TeachersId is not number array`);
  }
}
