const router = require("express").Router({ mergeParams: true });
const db = require("../models/index");
const { Op, ValidationError } = require("sequelize");
const questionService = require("../services/question_service");
const lectureService = require("../services/lecture_service");
const { requireAuthentication } = require("../../lib/auth");
const string_helpers = require("../../lib/string_helpers");

// GET /courses/course_id/questions?search=""&page=""&perPage=""
// gets all the questions for a given course
// Path is /courses/:course_id/questions
router.get("/", requireAuthentication, async function (req, res, next) {
  const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
  const courseId = parseInt(req.params["course_id"]);
  // check to make sure the user is a teacher for the specified course
  const enrollmentTeacher = await db.Enrollment.findOne({
    where: {
      userId: user.id,
      courseId: courseId,
      role: "teacher",
    },
  });

  if (enrollmentTeacher) {
    // we want search to have a value even if it is left out of the url
    const search = req.query.search != null ? req.query.search : "";
    // page and perPage are required query string parameters
    const page = req.query.page != null ? parseInt(req.query.page) : 0;
    const perPage =
      req.query.perPage != null ? parseInt(req.query.perPage) : 25;
    try {
      // get the questions needed
      const questions = await db.Question.findAll({
        limit: perPage,
        offset: page * perPage,
        where: {
          stem: {
            [Op.like]: "%" + search + "%",
          },
          lectureId: {
            [Op.in]: db.Sequelize.literal(
              `(SELECT id FROM Lectures WHERE courseId = ${courseId})`
            ),
          },
        },
        attributes: ["id", "lectureId", "type", "stem", "content", "answers"], // Ensure lectureId is included
      });

      // get the total questions for the course so that page number calculations can be made
      const totalQuestions = await db.Question.findAll({
        where: {
          stem: {
            [Op.like]: "%" + search + "%",
          },
          lectureId: {
            [Op.in]: db.Sequelize.literal(
              `(SELECT id FROM Lectures WHERE courseId = ${courseId})`
            ),
          },
        },
      });
      if (page * perPage <= totalQuestions.length) {
        const maxPageIndex = Math.ceil(totalQuestions.length / perPage) - 1;
        const nextPage = page + 1 <= maxPageIndex ? page + 1 : null; // dont let users go past the max page count
        const prevPage = page - 1 >= 0 ? page - 1 : null;
        const nextPageUrl =
          nextPage != null
            ? req.originalUrl.substring(0, req.originalUrl.indexOf("?")) +
              `?string=${search}&page=${nextPage}&perPage=${perPage}`
            : "";
        const prevPageUrl =
          prevPage != null
            ? req.originalUrl.substring(0, req.originalUrl.indexOf("?")) +
              `?string=${search}&page=${prevPage}&perPage=${perPage}`
            : "";
        // can use the response on the frontend to determine if there are more pages that can be reached forwards/backwards
        res.status(200).send({
          questions: questionService.extractArrayQuestionFields(questions),
          links: {
            nextPage: nextPageUrl,
            prevPage: prevPageUrl,
          },
        });
      } else {
        res.status(400).send({
          error: `page number given is out of bounds, there are not that many courses`,
        });
      }
    } catch (e) {
      console.error("Error fetching questions:", e);
      next(e); // catch anything weird that might happen
    }
  } else {
    res.status(403).send({
      error: `Only the teacher for a course can view all the questions`,
    });
  }
});

// POST /courses/course_id/questions
// create a new question for a given course
router.post("/", requireAuthentication, async function (req, res, next) {
  const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
  const courseId = parseInt(req.params["course_id"]);
  // check to make sure the user is a teacher for the specified course
  const enrollmentTeacher = await db.Enrollment.findOne({
    where: {
      userId: user.id,
      courseId: courseId,
      role: "teacher",
    },
  });

  if (!enrollmentTeacher) {
    return res
      .status(403)
      .send({ error: `Only the teacher for a course can create a question` });
  }

  let questionToInsert = { ...req.body, courseId: courseId };
  const missingRequestFields =
    questionService.validateQuestionCreationRequest(questionToInsert);
  if (!missingRequestFields) {
    return res.status(400).send({
      error: `Request is missing the following required fields: ${missingRequestFields}`,
    });
  }

  // Check if question has the key 'weights' and if it doesn't then create it and assign each weight to 1
  if (!questionToInsert.weights) {
    questionToInsert.weights = {};
    for (let i = 0; i < Object.keys(questionToInsert.answers).length; i++) {
      questionToInsert.weights[i] = 1;
    }
  }
  // questionToInsert.totalPoints = 0;

  try {
    const question = await db.Question.create(
      questionService.extractQuestionUpdateFields(questionToInsert)
    );

    let questionInLecture = null;
    if (req.query.checklectureinsection === "true") {
      // add the question to lectureInSection if the lecture template
      // has already been attached to a section
      const lecture = await lectureService.getLectureInCourse(
        question.lectureId,
        courseId
      );

      const existingLectureForSection = await db.LectureForSection.findOne({
        where: { lectureId: lecture.id },
      });

      questionInLecture = await db.QuestionInLecture.create({
        lectureForSectionId: existingLectureForSection.id,
        questionId: question.id,
        published: false,
      });
    }

    return res.status(201).send({
      question: questionService.extractQuestionFields(question),
      questionInLecture,
    });
  } catch (e) {
    // console.error("Error creating question:", e);
    if (e instanceof ValidationError) {
      res.status(400).send({
        error: string_helpers.serializeSequelizeErrors(e),
      });
    } else {
      next(e); // catch anything weird that happens
    }
  }
});

// PUT /courses/course_id/questions/question_id
// update an existing question
router.put(
  "/:question_id",
  requireAuthentication,
  async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub);
    const courseId = parseInt(req.params["course_id"]);
    const questionId = parseInt(req.params["question_id"]);

    // check to ensure the user is a teacher for the specified course
    const enrollmentTeacher = await db.Enrollment.findOne({
      where: {
        userId: user.id,
        courseId: courseId,
        role: "teacher",
      },
    });

    if (!enrollmentTeacher) {
      return res
        .status(403)
        .send({ error: `Only the teacher for a course can update a question` });
    }

    // validate request body and extract update fields
    const updateData = questionService.extractQuestionUpdateFields(req.body);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({
        error: `Request body must contain fields to update.`,
      });
    }

    try {
      // call the service to perform the update
      const [rowsUpdated] = await db.Question.update(updateData, {
        where: { id: questionId },
        individualHooks: true,
      });

      if (rowsUpdated > 0) {
        const updatedQuestion = await db.Question.findByPk(questionId);

        return res.status(200).send({
          question: questionService.extractQuestionFields(updatedQuestion),
        });
      } else {
        return res
          .status(404)
          .send({ error: `Question with ID ${questionId} not found` });
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        return res.status(400).send({
          error: string_helpers.serializeSequelizeErrors(e),
        });
      } else {
        next(e);
      }
    }
  }
);

module.exports = router;
