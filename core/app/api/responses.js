const router = require("express").Router({ mergeParams: true });
const db = require("../models/index");
const { requireAuthentication } = require("../../lib/auth");
const { serializeSequelizeErrors } = require("../../lib/string_helpers");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const questionService = require("../services/question_service");
const responseService = require("../services/response_service");
const gradeService = require("../services/grade_service");
const { log } = require("winston");

// student is answering a question
// Path is /courses/:course_id/lectures/:lecture_id/questions/:question_id/responses
router.post("/", requireAuthentication, async function (req, res, next) {
	try {
	  // Parse route parameters
	  const courseId = parseInt(req.params["course_id"], 10);
	  const lectureId = parseInt(req.params["lecture_id"], 10);
	  const questionId = parseInt(req.params["question_id"], 10);
	  const user = await db.User.findByPk(req.payload.sub);
	  if (!user || !courseId || !lectureId || !questionId) {
		return res.status(400).send({ error: "Invalid request parameters" });
	  }
  
	  // Ensure the user is enrolled as a student in the course
	  const enrollmentStudent = await db.Enrollment.findOne({
		where: { role: "student", userId: user.id },
		include: [{
		  model: db.Section,
		  required: true,
		  where: { courseId }
		}]
	  });
	  if (!enrollmentStudent) {
		return res.status(403).send({ error: "Only a student in the course can submit a response" });
	  }
  
	  // Access the Section object
	  const section = enrollmentStudent.Section || enrollmentStudent.section;
	  if (!section) {
		return res.status(404).send({ error: "Section not found" });
	  }
  
	  // Find the LectureForSection record
	  const lectureForSection = await db.LectureForSection.findOne({
		where: {
		  sectionId: section.id,
		  lectureId: lectureId
		}
	  });
	  if (!lectureForSection) {
		return res.status(404).send({ error: "Lecture for section not found" });
	  }
  
	  // Validate that answers are provided and include at least two options
	  if (!req.body.answers || Object.keys(req.body.answers).length < 2) {
		return res.status(400).send({
		  error: "Submission must be present and must contain at least two options"
		});
	  }
  
	  // Find the question in lecture by joining LectureForSection filtering on lectureId.
	  const questionInLecture = await db.QuestionInLecture.findOne({
		attributes: [
		  "id",
		  "questionId",
		  "lectureForSectionId",
		  "published",
		  "softDelete",
		  "publishedAt",
		  "createdAt",
		  "updatedAt"
		],
		where: { questionId, lectureForSectionId: lectureForSection.id },
		include: [{
		  model: db.LectureForSection, 
		  required: true,
		  attributes: [
			"id",
			"sectionId",
			"lectureId",
			"published",
			"closedAt",
			"attendanceMethod",
			"minAttendanceQuestions",
			"createdAt",
			"updatedAt"
		  ],
		  where: { lectureId } 
		}]
	  });
	  if (!questionInLecture) {
		return res.status(404).send({
		  error: "No question in lecture found for the given lecture and question"
		});
	  }
	  if (questionInLecture.published !== true) {
		return res.status(400).send({ error: "The question is not published" });
	  }
  
	  // Get the question from the course directly
	  const question = await db.Question.findOne({
		where: { id: questionId }
	  });

	  console.log("responses.js Question:", question);

	  if (!question) {
		return res.status(404).send({ error: "Question not found" });
	  }
  
	  // Calculate points: totalPoints is the sum of all weights;
	  // points is the sum of weights for each answer that is marked true.
	  let totalCorrectWeight = 0;
	  let correctPoints = 0;
	  let extraPenalty = 0;
 
	  const weights = question.weights;  // e.g., { "0": 1, "1": 1, "2": 1, "3": 1 }
	  const correctAnswers = question.answers; // e.g., { "0": false, "1": true, "2": false, "3": false }

	  for (let key in weights) {
		if (correctAnswers[key] === true) {
		  // This option is correct; add its weight to the total correct weight.
		  totalCorrectWeight += weights[key];
		  // If the student selected it, add its weight as correct points.
		  if (req.body.answers[key] === true) {
			correctPoints += weights[key];
		  }
		} else {
		  // This option is not correct.
		  // If the student selected an incorrect option, count that as a penalty.
		  if (req.body.answers[key] === true) {
			extraPenalty += weights[key];
		  }
		}
	  }

	  // Compute the score. You might choose to subtract the penalty, ensuring the score doesn't drop below zero.
	  let computedScore = totalCorrectWeight > 0 ? (correctPoints - extraPenalty) : 0;
	  if (computedScore < 0) computedScore = 0;



	  // Override the computed values with those from req.query if provided
	//   if (req.query.points && req.query.totalPoints) {
	// 	correctPoints = Number(req.query.points);
	// 	totalCorrectWeight = Number(req.query.totalPoints);
	// 	computedScore = totalCorrectWeight ? correctPoints / totalCorrectWeight : 0;
	//   }
  
	  // Prepare the response record data
	  const responseToInsert = {
		enrollmentId: enrollmentStudent.id,
		questionInLectureId: questionInLecture.id,
		score: computedScore, // now reflects the override if provided
		submission: req.body.answers,
		points: correctPoints,
		totalPoints: totalCorrectWeight
	  };

  
	  // Create the Response record
	  const responseRecord = await db.Response.create(
		responseService.extractResponseInsertFields(responseToInsert)
	  );

  
	  // Retrieve or create the student’s Grade record for this course.
	  const studentGrade = await db.Grades.findOne({
		where: { enrollmentId: enrollmentStudent.id, userId: user.id },
		include: [{
		  model: db.Enrollment,
		  required: true,
		  where: { courseId }
		}]
	  });

		if (!studentGrade) {
			const newGrade = {
			userId: user.id,
			enrollmentId: enrollmentStudent.id,
			sectionId: enrollmentStudent.sectionId,
			points: correctPoints,
			totalPoints: totalCorrectWeight,
			grade: computedScore,
			lectureForSectionId: lectureForSection.id 
		};
		await db.Grades.create(gradeService.extractResponseInsertFields(newGrade));
	  } else {
		// Update existing grade by accumulating points and totalPoints.
		studentGrade.points += correctPoints;
		studentGrade.totalPoints += totalCorrectWeight;
		const newGradeValue = studentGrade.totalPoints ? studentGrade.points / studentGrade.totalPoints : 0;
		await studentGrade.update({
		  points: studentGrade.points,
		  totalPoints: studentGrade.totalPoints,
		  grade: newGradeValue,
		  lectureForSectionId: lectureForSection.id 
		});
	  }
  
	  res.status(201).send({
		response: responseService.extractResponseFields(responseRecord)
	  });
	} catch (e) {
	  console.error("Error processing response:", e);
	  next(e);
	}
  });
  

// this route isn't even implemented in the frontend
// student is resubmitting their answer to a question
// Path is /courses/:course_id/lectures/:lecture_id/questions/:question_id/responses/:response_id
router.put(
	"/:response_id",
	requireAuthentication,
	async function (req, res, next) {
		const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
		const responseId = parseInt(req.params["response_id"]);
		const courseId = parseInt(req.params["course_id"]);
		const lectureId = parseInt(req.params["lecture_id"]);
		const questionId = parseInt(req.params["question_id"]);
		if (!user) {
			return res.status(403).send({
				error: `Only a student in the course can submit a response to the question`,
			});
		}
		// validate request parameters
		if (!responseId || !courseId || !lectureId || !questionId) {
			return res.status(400).send({
				error: `Invalid request parameters`,
			});
		}

		// check to make sure the user is a student for the specified course
		const enrollmentStudent = await db.Enrollment.findOne({
			where: { role: "student", userId: user.id },
			include: [
				{
					model: db.Section,
					required: true,
					where: { courseId: courseId },
				},
			],
		});

		// write a query to find the response
		const oldResponse = await db.Response.findByPk(responseId);
		// SELECT * FROM Responses WHERE id = ${responseId} AND Enrollment.userId = ${user.id}, { model: db.Response };

		if (!enrollmentStudent) {
			return res.status(403).send({
				error: `Only a student in the course can submit a response to the question`,
			});
		}

		if (!req.body.answers || !(Object.keys(req.body.answers).length > 1)) {
			return res.status(400).send({
				error: `Submission must be present and must contain at least two options`,
			});
		}

		if (!oldResponse) {
			return res.status(404).send({
				error: "response with given id not found",
			});
		}

		if (oldResponse.enrollmentId !== enrollmentStudent.id) {
			return res.status(403).send({
				error: `Only a student in the course can submit a response to the question`,
			});
		}

		try {
			const questionInLecture = await questionService.getQuestionInLecture(
				questionId,
				lectureId
			);
			if (!questionInLecture) {
				return res.status(404).send({
					error: `No question in lecture found for the given lecture and question`,
				});
			}

			if (questionInLecture.published !== true) {
				return res.status(400).send({
					error: `The question is not published`,
				});
			}

			const question = await questionService.getQuestionInCourse(
				questionId
			);
			let totalCorrectWeight = 0;
			let correctPoints = 0;
			let extraPenalty = 0;

			const weights = question.weights;  // e.g., { "0": 1, "1": 1, "2": 1, "3": 1 }
			const correctAnswers = question.answers; // e.g., { "0": false, "1": true, "2": false, "3": false }

			for (let key in weights) {
				if (correctAnswers[key] === true) {
					// This option is correct; add its weight to the total correct weight.
					totalCorrectWeight += weights[key];
					// If the student selected it, add its weight as correct points.
					if (req.body.answers[key] === true) {
						correctPoints += weights[key];
					}
				} else {
					// This option is not correct.
					// If the student selected an incorrect option, count that as a penalty.
					if (req.body.answers[key] === true) {
						extraPenalty += weights[key];
					}
				}
			}

			// Compute the score. You might choose to subtract the penalty, ensuring the score doesn't drop below zero.
			let computedScore = totalCorrectWeight > 0 ? (correctPoints - extraPenalty) / totalCorrectWeight : 0;
			if (computedScore < 0) computedScore = 0;

			// Override the computed values with those from req.query if provided
			if (req.query.points && req.query.totalPoints) {
				correctPoints = Number(req.query.points);
				totalCorrectWeight = Number(req.query.totalPoints);
				computedScore = totalCorrectWeight ? correctPoints / totalCorrectWeight : 0;
			}

			const responseToUpdate = {
				score: computedScore,
				submission: req.body.answers,
			};
			const response = await oldResponse.update(responseToUpdate);
			res.status(200).send({
				response: responseService.extractResponseFields(response),
			});
		} catch (e) {
			next(e);
		}
	}
);

module.exports = router;
