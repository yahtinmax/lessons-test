const express = require("express"),
  router = express.Router(),
  controller = require("../controllers/mainController");

router.get("/", async (req, res, next) => {
  try {
    const result = await controller.getLessons({
      date: !req.query.date ? null : req.query.date.split(","),
      status: !req.query.status ? null : req.query.status,
      teachersIds: !req.query.teachersIds
        ? null
        : req.query.teachersIds.split(","),
      studentsCount: !req.query.studentsCount
        ? null
        : req.query.studentsCount.split(","),
      page: !req.query.page || isNaN(req.query.page) ? 1 : +req.query.page,
      lessonsPerPage:
        !req.query.lessonsPerPage || isNaN(req.query.lessonsPerPage)
          ? 5
          : req.query.lessonsPerPage,
    });
    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.post("/lessons", async (req, res, next) => {
  try {
    const result = await controller.createLessons({
      teachersIds: !req.body.teachersIds ? null : req.body.teachersIds,
      title: !req.body.title ? null : req.body.title,
      days: !req.body.days ? null : req.body.days,
      firstDate: !req.body.firstDate ? null : req.body.firstDate,
      lessonsCount: !req.body.lessonsCount ? null : req.body.lessonsCount,
      lastDate: !req.body.lastDate ? null : req.body.lastDate,
    });
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
