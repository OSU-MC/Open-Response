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
	const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
	const courseId = parseInt(req.params["course_id"]);
	const lectureId = parseInt(req.params["lecture_id"]);
	const questionId = parseInt(req.params["question_id"]);
	let points = 0,
		totalPoints = 0;
	// const points = parseInt(req.params["points"]) || 0;
	// const totalPoints = parseInt(req.params["total_points"]) || 0;
	// code to check if the req params are valid
	if (!user || !courseId || !lectureId || !questionId) {
		return res.status(400).send({
			error: `Invalid request parameters`,
		});
	}

	// for now, only multiple choice and multiple answer available
	try {
		const enrollmentStudent = await db.Enrollment.findOne({
			// check to make sure the user is a student for the specified course
			where: { role: "student", userId: user.id },
			include: [
				{
					model: db.Section,
					required: true,
					where: { courseId: courseId },
				},
			],
		});
		const questionInLecture = await questionService.getQuestionInLecture(
			questionId,
			lectureId
		);
		if (!enrollmentStudent)
			return res.status(403).send({
				error: `Only a student in the course can submit a response to the question`,
			});
		if (!req.body.answers || !(Object.keys(req.body.answers).length > 1))
			// request must have an answer and it must have at least two options to pick from
			return res.status(400).send({
				error: `Submission must be present and must contain at least two options`,
			});
		if (!questionInLecture)
			return res.status(404).send({
				error: `No question in lecture found for the given lecture and question`,
			});
		if (questionInLecture.published != true)
			// question is no longer available
			return res.status(400).send({ error: `The question is not published` });

		// if the question in lecture exists, we know there is a question that we can check for scoring
		const question = await questionService.getQuestionInCourse(
			questionId,
			courseId
		);
		const questionScore = questionService.getQuestionScore(question, req.body);
		const responseToInsert = {
			enrollmentId: enrollmentStudent.id,
			questionInLectureId: questionInLecture.id,
			score: questionScore,
			submission: req.body.answers,
		};

		// question.data.Values.weights looks like: weights: { '0': 1, '1': 1, '2': 1, '3': 1 }
		// Assign points equal to the sum of the weights of the true answers selected and totalPoints equal to the sum of all correct answers
		for (let i = 0; i < Object.keys(question.dataValues.weights).length; i++) {
			totalPoints += question.dataValues.weights[i];
			if (req.body.answers[i] === true) {
				points += question.dataValues.weights[i];
			}
		}
		if (points && totalPoints) {
			responseToInsert.points = points;
			responseToInsert.totalPoints = totalPoints;
		}

		const response = await db.Response.create(
			responseService.extractResponseInsertFields(responseToInsert)
		);

		// pull the grade for the current student by enrollment id and user.id. If it doesn't exist, create it; If it does exist update the score, points and totalPoints.
		const studentGrade = await db.Grades.findOne({
			where: { enrollmentId: enrollmentStudent.id, userId: user.id },
			include: [
				{
					model: db.Enrollment,
					required: true,
					where: { courseId: courseId },
				},
			],
		});

		let newGrade = {};
		newGrade.userId = user.id;
		newGrade.enrollmentId = enrollmentStudent.id;
		newGrade.sectionId = enrollmentStudent.sectionId;
		if (!studentGrade) {
			newGrade.points = points;
			newGrade.totalPoints = totalPoints;
			newGrade.grade = newGrade.points / newGrade.totalPoints;
			if (isNaN(newGrade.grade)) newGrade.grade = 0;

			const updatedGrade = await db.Grades.create(
				gradeService.extractResponseInsertFields(newGrade)
			);
		} else {
			newGrade.points = studentGrade.points += points;
			newGrade.totalPoints = studentGrade.totalPoints += totalPoints;
			newGrade.score = newGrade.points / newGrade.totalPoints;

			const updatedGrade = await studentGrade.update({
				grade: studentGrade.grade,
				points: studentGrade.points,
				totalPoints: studentGrade.totalPoints,
			});
		}

		res.status(201).send({
			response: responseService.extractResponseFields(response),
		});
	} catch (e) {
		console.log(e);
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
				questionId,
				courseId
			);
			const questionScore = questionService.getQuestionScore(
				question,
				req.body
			);
			const responseToUpdate = {
				score: questionScore,
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
