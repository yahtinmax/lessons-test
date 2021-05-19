const req = require("supertest");
const app = require("./app");
const sequelizeConfig = require("./sequelize.config");
const dateFns = require("date-fns");
const { Sequelize } = require("sequelize");

describe("GET Lessons", () => {
  beforeAll(() => {
    expect.extend({
      inRangeNumbers(received, floor, ceiling) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
          return {
            message: () =>
              `expected ${received} not to be within range ${floor} - ${ceiling}`,
            pass: true,
          };
        } else {
          return {
            message: () =>
              `expected ${received} to be within range ${floor} - ${ceiling}`,
            pass: false,
          };
        }
      },
      inRangeDates(received, floor, ceiling) {
        const pass = dateFns.isWithinInterval(new Date(received), {
          start: new Date(floor),
          end: new Date(ceiling),
        });
        if (pass) {
          return {
            message: () =>
              `expected ${received} not to be within range ${floor} - ${ceiling}`,
            pass: true,
          };
        } else {
          return {
            message: () =>
              `expected ${received} to be within range ${floor} - ${ceiling}`,
            pass: false,
          };
        }
      },
    });
  });

  it("GET / with no query params -----------> should return 5 elements on page 1", () => {
    return req(app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.length).toEqual(5);
        expect(res.body[0].id).toEqual(1);
        expect(res.body[res.body.length - 1].id).toEqual(5);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              date: expect.any(String),
              visitCount: expect.any(String),
              status: expect.any(Number),
              students: expect.arrayContaining([
                expect.objectContaining({
                  visit: expect.any(Boolean),
                }),
              ]),
              teachers: expect.arrayContaining([expect.any(Object)]),
            }),
          ])
        );
      });
  });

  it("GET /?lessonsPerPage=1?page=2 query param -----------> should return elements on page 2 with id 2", () => {
    return req(app)
      .get("/")
      .query({ lessonsPerPage: 1, page: 2 })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body.length).toEqual(1);
        expect(res.body[0].id).toEqual(2);
      });
  });

  it("GET /?date=2019-09-02 query param -----------> should return elements with date 2019-09-02", () => {
    return req(app)
      .get("/")
      .query({ date: "2019-09-02" })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.forEach((e) => {
          expect(e.date).toEqual("2019-09-02");
        });
      });
  });

  it("GET /?date=2019-09-01,2019-09-02 query param -----------> should return elements with date between 2019-09-01 and 2019-09-02", () => {
    return req(app)
      .get("/")
      .query({ date: "2019-09-01,2019-09-02" })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.forEach((e) => {
          expect(e.date).inRangeDates("2019-09-01", "2019-09-02");
        });
      });
  });

  it("GET /?studentsCount=4 query param -----------> should return elements where students count equal 4", () => {
    return req(app)
      .get("/")
      .query({
        studentsCount: 4,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.forEach((e) => {
          expect(e.students.length).toEqual(4);
        });
      });
  });

  it("GET /?studentsCount=3,4 query param -----------> should return elements where students count equals 3 || 4", () => {
    return req(app)
      .get("/")
      .query({
        studentsCount: "3,4",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.forEach((e) => {
          expect(e.students.length).inRangeNumbers(3, 4);
        });
      });
  });

  it("GET /?teachersIds=1 query param -----------> should return elements having teacher with id = 1", () => {
    return req(app)
      .get("/")
      .query({
        teachersIds: "1",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.forEach((e) => {
          expect(e.teachers.length).toEqual(1);
          expect(e.teachers[0].id).toEqual(1);
        });
      });
  });

  it("GET /?teachersIds=1,3 query param -----------> should return elements having teacher with id between 1 and 3", () => {
    return req(app)
      .get("/")
      .query({
        teachersIds: "1,3",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.forEach((e) => {
          e.teachers.forEach((teacher) => {
            expect(teacher.id).inRangeNumbers(1, 3);
          });
        });
      });
  });

  it("GET /?status=0 query param -----------> should return elements having status 0", () => {
    return req(app)
      .get("/")
      .query({
        status: 0,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.forEach((e) => {
          expect(e.status).toEqual(0);
        });
      });
  });

  it("GET /?status=0&date=2019-06-17,2019-06-24&studentsCount=2&teachersIds=1,3 -----------> should return elements having those conditions", () => {
    return req(app)
      .get("/")
      .query({
        status: 0,
        date: "2019-06-17,2019-06-24",
        studentsCount: 2,
        teachersIds: "1,3",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        res.body.forEach((e) => {
          expect(e.status).toEqual(0);
          expect(e.date).inRangeDates("2019-06-17", "2019-06-24");
          e.teachers.forEach((teacher) => {
            expect(teacher.id).inRangeNumbers(1, 3);
          });
          expect(e.students.length).toEqual(2);
        });
      });
  });

  it("GET /?status=7 -----------> shouldn't work", () => {
    return req(app)
      .get("/")
      .query({
        status: 7,
      })
      .expect(400);
  });

  it("GET /?studentCount=1,2,3 -----------> shouldn't work", () => {
    return req(app)
      .get("/")
      .query({
        studentsCount: "1,2,3",
      })
      .expect(400);
  });

  it("GET /?date=dd-MM-yy -----------> shouldn't work", () => {
    return req(app)
      .get("/")
      .query({
        date: "dd-MM-yy",
      })
      .expect(400);
  });

  it("GET /?teachersIds=Alisa -----------> shouldn't work", () => {
    return req(app)
      .get("/")
      .query({
        teachersIds: "Alisa",
      })
      .expect(400);
  });
});

describe("POST Lessons", () => {
  it("POST /lessons from 2021-01-01, count 300, day = Monday -----------> should return array lengths 52", () => {
    return req(app)
      .post("/lessons")
      .send({
        teachersIds: [1, 2, 3],
        title: "Blue Ocean",
        days: [1],
        firstDate: "2021-01-01",
        lessonsCount: 300,
      })
      .expect("Content-Type", /json/)
      .expect(201)
      .then((res) => {
        expect(res.body.length).toEqual(52);
      });
  });

  it("POST /lessons from 2021-01-01 to 2021-12-31, days = 0 - 6 -----------> should return array lengths 300", () => {
    return req(app)
      .post("/lessons")
      .send({
        teachersIds: [1, 2, 3],
        title: "Blue Ocean",
        days: [0, 1, 2, 3, 4, 5, 6],
        firstDate: "2021-01-01",
        lastDate: "2021-12-31",
      })
      .expect("Content-Type", /json/)
      .expect(201)
      .then((res) => {
        expect(res.body.length).toEqual(300);
      });
  });

  it("POST /lessons with from, last, count -----------> shouldn't work", () => {
    return req(app)
      .post("/lessons")
      .send({
        teachersIds: [1, 2, 3],
        title: "Blue Ocean",
        days: [0, 1, 2, 3, 4, 5, 6],
        firstDate: "2021-01-01",
        lessonsCount: 200,
        lastDate: "2021-12-31",
      })
      .expect(400);
  });

  it("POST /lessons with period > 1 year -----------> shouldn't work", () => {
    return req(app)
      .post("/lessons")
      .send({
        teachersIds: [1, 2, 3],
        title: "Blue Ocean",
        days: [0, 1, 2, 3, 4, 5, 6],
        firstDate: "2021-01-01",
        lastDate: "2022-01-02",
      })
      .expect(400);
  });

  it("POST /lessons with lessonsCount > 300 -----------> shouldn't work", () => {
    return req(app)
      .post("/lessons")
      .send({
        teachersIds: [1, 2, 3],
        title: "Blue Ocean",
        days: [0, 1, 2, 3, 4, 5, 6],
        firstDate: "2021-01-01",
        lessonsCount: 301,
      })
      .expect(400);
  });

  it("POST /lessons with lessonsCount > days.length -----------> shouldn't work", () => {
    return req(app)
      .post("/lessons")
      .send({
        teachersIds: [1, 2, 3],
        title: "Blue Ocean",
        days: [0, 1, 2, 3, 4, 5, 6],
        firstDate: "2021-01-01",
        lessonsCount: 1,
      })
      .expect(400);
  });
});
