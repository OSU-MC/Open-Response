const router = require("express").Router({ mergeParams: true });
const db = require("../models/index");
const { Op, ValidationError } = require("sequelize");
const questionService = require("../services/question_service");
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
					courseId: courseId,
				},
			});
			// get the total questions for the course so that page number calculations can be made
			const totalQuestions = await db.Question.findAll({
				where: {
					stem: {
						[Op.like]: "%" + search + "%",
					},
					courseId: courseId,
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

	try {
		const question = await db.Question.create(
			questionService.extractQuestionUpdateFields(questionToInsert)
		);
		return res.status(201).send({
			question: questionService.extractQuestionFields(question),
		});
	} catch (e) {
		if (e instanceof ValidationError) {
			res.status(400).send({
				error: string_helpers.serializeSequelizeErrors(e),
			});
		} else {
			next(e); // catch anything weird that happens
		}
	}
});

module.exports = router;
