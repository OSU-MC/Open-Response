const router = require("express").Router({ mergeParams: true });
const db = require("../models/index");
const { requireAuthentication } = require("../../lib/auth");
const { serializeSequelizeErrors } = require("../../lib/string_helpers");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const questionService = require("../services/question_service");
const responseService = require("../services/response_service");

// URL: /courses/course_id/grades
// teacher wants to get grades for each student in the course
// student wants to get their grade for a course
router.get("/", requireAuthentication, async function (req, res, next) {
	const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
	const courseId = parseInt(req.params["course_id"]);
	const sectionId = parseInt(req.params["section_id"]);

	// check if user is a teacher for the course
	const enrollmentTeacher = await db.Enrollment.findOne({
		where: {
			userId: user.id,
			courseId: courseId,
			role: "teacher",
		},
	});

	// check if user is a student in the correct section for the correct course
	const enrollmentStudent = await db.Enrollment.findOne({
		where: {
			role: "student",
			userId: user.id,
			sectionId: sectionId,
		},
	});

	// check to make sure given section is part of the correct course
	const sectionCheck = await db.Section.findOne({
		where: {
			id: sectionId,
			courseId: courseId,
		},
	});

	// get all student grades as well as grades for each lecture
	// lecture id also returned for links to the lecture
	if (enrollmentTeacher) {
		try {
			// Response format:
			/*
            {
                [
                    {
                        studentName,
                        studentId,
                        grade: (as a percentage),
                        totalQuestions,
                        totalAnswered,
                        totalScore,
                        lectures: [
                            {
                                lectureId,
                                lectureGrade,
                                totalAnswered,
                                totalQuestions,
                                totalScore
                            }
                        ]
                    },
                    ...
                ]
            }
            */
			let resp = [];

			// get students in the section
			const students = await db.User.findAll({
				include: [
					{
						model: db.Enrollment,
						required: true,
						where: {
							sectionId: sectionId,
						},
					},
				],
			});

			// get lectures for the section
			const lectures = await db.Lecture.findAll({
				include: [
					{
						model: db.LectureForSection,
						required: true,
						where: {
							sectionId: sectionId,
							published: true,
						},
					},
				],
			});

			// for each student in the section
			for (let i = 0; i < students.length; i++) {
				let studentGradeObj = {
					studentName: `${students[i].firstName} ${students[i].lastName}`,
					studentId: students[i].id,
					lectures: [],
				};
				let totalScore = 0;
				let totalQuestionsAsked = 0;
				let totalQuestionsAnswered = 0;
				let totalPoints = 0;
				let points = 0;
				// for each lecture in the section
				for (let j = 0; j < lectures.length; j++) {
					// get all the questions asked during the lecture
					const questionsInLecture = await db.QuestionInLecture.findAll({
						where: {
							lectureId: lectures[j].id,
						},
					});
					let lectureGradeObj = {};
					let lectureScore = 0;
					let lectureQuestionsAsked = 0;
					let lectureQuestionsAnswered = 0;
					// for each question in the lecture, get the students response/score
					for (let k = 0; k < questionsInLecture.length; k++) {
						totalQuestionsAsked++;
						lectureQuestionsAsked++;
						// get student answer if it exists
						const response = await db.Response.findOne({
							where: {
								questionInLectureId: questionsInLecture[k].id,
							},
							include: [
								{
									model: db.Enrollment,
									required: true,
									where: {
										userId: students[i].id,
									},
								},
							],
						});
						if (response) {
							totalPoints = response.totalPoints;
							points = response.points;
							totalScore += response.score;
							totalQuestionsAnswered++;
							lectureScore += response.score;
							lectureQuestionsAnswered++;
						}
					}
					lectureGradeObj.lectureId = lectures[j].id;
					lectureGradeObj.lectureGrade = parseFloat(
						(lectureScore / lectureQuestionsAsked).toFixed(2)
					);
					lectureGradeObj.totalAnswered = lectureQuestionsAnswered;
					lectureGradeObj.totalQuestions = lectureQuestionsAsked;
					lectureGradeObj.totalScore = lectureScore;
					lectureGradeObj.totalPoints = totalPoints;
					lectureGradeObj.points = points;
					studentGradeObj.lectures.push(lectureGradeObj);
					studentGradeObj.grade = parseFloat(
						(lectureScore / lectureQuestionsAsked).toFixed(2)
					);
					studentGradeObj.pointScore = parseFloat(
						(lectureScore / lectureQuestionsAsked).toFixed(2)
					);
				}
				studentGradeObj.totalQuestions = totalQuestionsAsked;
				studentGradeObj.totalAnswered = totalQuestionsAnswered;
				studentGradeObj.totalScore = totalScore;
				resp.push(studentGradeObj);
			}

			res.status(200).send(resp);
		} catch (e) {
			next(e);
		}
	}
	// get student grade in the course as well as grade for each indiivdual lecture
	else if (enrollmentStudent && sectionCheck) {
		try {
			// Response format:
			/*
                [
                    {
                        lectureId,
                        lectureGrade,
                        totalAnswered,
                        totalQuestions,
                        totalScore
                    },
                    ...
                ]
            */

			let resp = [];

			// get lectures for the section
			const lectures = await db.Lecture.findAll({
				include: [
					{
						model: db.LectureForSection,
						required: true,
						where: {
							sectionId: sectionId,
							published: true,
						},
					},
				],
			});

			let totalScore = 0;
			let totalQuestionsAsked = 0;
			let totalQuestionsAnswered = 0;
			// for each lecture in the section
			for (let j = 0; j < lectures.length; j++) {
				// get all the questions asked during the lecture
				const questionsInLecture = await db.QuestionInLecture.findAll({
					where: {
						lectureId: lectures[j].id,
					},
				});
				let lectureGradeObj = {};
				let lectureScore = 0;
				let lectureQuestionsAsked = 0;
				let lectureQuestionsAnswered = 0;
				// for each question in the lecture, get the students response/score
				for (let k = 0; k < questionsInLecture.length; k++) {
					totalQuestionsAsked++;
					lectureQuestionsAsked++;
					// get student answer if it exists
					const response = await db.Response.findOne({
						where: {
							questionInLectureId: questionsInLecture[k].id,
							enrollmentId: enrollmentStudent.id,
						},
					});
					if (response) {
						totalScore += response.score;
						totalQuestionsAnswered++;
						lectureScore += response.score;
						lectureQuestionsAnswered++;
					}
				}
				lectureGradeObj.lectureId = lectures[j].id;
				lectureGradeObj.lectureGrade = parseFloat(
					(lectureScore / lectureQuestionsAsked).toFixed(2)
				);
				lectureGradeObj.totalAnswered = lectureQuestionsAnswered;
				lectureGradeObj.totalQuestions = lectureQuestionsAsked;
				lectureGradeObj.totalScore = lectureScore;
				resp.push(lectureGradeObj);
			}

			res.status(200).send(resp);
		} catch (e) {
			next(e);
		}
	} else {
		// this will also catch the case where the section id is not valid or the course id is not valid
		// (not valid meaning doesn't exist or doesn't exist for this course)
		res.status(403).send({
			error: `Only a teacher or student for the given course/section can see grades for the course`,
		});
	}
});

//URL: /courses/:course_id/sections/:section_id/grades/all
router.get("/all", requireAuthentication, async function (req, res, next) {
	const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
	const courseId = parseInt(req.params["course_id"]);
	const sectionId = parseInt(req.params["section_id"]);

	// check if user is a teacher for the course
	const enrollmentTeacher = await db.Enrollment.findOne({
		where: {
			userId: user.id,
			courseId: courseId,
			role: "teacher",
		},
	});

	// check if user is a student in the correct section for the correct course
	const enrollmentStudent = await db.Enrollment.findOne({
		where: {
			role: "student",
			userId: user.id,
			sectionId: sectionId,
		},
	});

	// check to make sure given section is part of the correct course
	const sectionCheck = await db.Section.findOne({
		where: {
			id: sectionId,
			courseId: courseId,
		},
	});

	// Check if the user is a teacher or student for the course/section
	if (!enrollmentStudent && !sectionCheck) {
		if (!enrollmentTeacher) {
			res.status(403).send({
				error: `Only a teacher or student for the given course/section can see grades for the course`,
			});
			return;
		}
	}

	// Get the grades for each student in the section
	if (enrollmentTeacher) {
		const students = await db.User.findAll({
			include: [
				{
					model: db.Enrollment,
					required: true,
					where: {
						sectionId: sectionId,
					},
				},
			],
		});

		const grades = await db.Grades.findAll({
			where: {
				sectionId: sectionId,
			},
		});

		const studentGrades = [];
		for (let i = 0; i < students.length; i++) {
			const studentGrade =
				grades.find((grade) => grade.userId === students[i].id) || 0;
			studentGrades.push({
				studentId: students[i].id,
				studentName: `${students[i].firstName} ${students[i].lastName}`,
				grade: studentGrade.grade,
			});
		}

		res.status(200).send(studentGrades);
		return;
	}

	// Return the grade for the individual student
	if (enrollmentStudent) {
		const grades = await db.Grades.findAll({
			where: {
				sectionId: sectionId,
			},
		});

		const studentGrades = [];
		const studentGrade = grades.find((grade) => grade.userId === user.id) || 0;
		studentGrades.push({
			studentId: user.id,
			studentName: `${user.firstName} ${user.lastName}`,
			grade: studentGrade.grade,
		});

		res.status(200).send(studentGrades);
		return;
	}
});

router.get(
	"/:student_id",
	requireAuthentication,
	async function (req, res, next) {
		const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
		const courseId = parseInt(req.params["course_id"]);
		const sectionId = parseInt(req.params["section_id"]);
		const studentId = parseInt(req.params["student_id"]);

		// if (user.id !== studentId) {
		// 	res.status(403).send({
		// 		error: `Only a teacher or student for the given course/section can see grades for the course`,
		// 	});
		// 	return;
		// }

		// check if user is a teacher for the course
		const enrollmentTeacher = await db.Enrollment.findOne({
			where: {
				userId: user.id,
				courseId: courseId,
				role: "teacher",
			},
		});

		// check if user is a student in the correct section for the correct course
		const enrollmentStudent = await db.Enrollment.findOne({
			where: {
				role: "student",
				userId: user.id,
				sectionId: sectionId,
			},
		});

		// check to make sure given section is part of the correct course
		const sectionCheck = await db.Section.findOne({
			where: {
				id: sectionId,
				courseId: courseId,
			},
		});

		// Check if the user is a teacher or student for the course/section
		if ((!enrollmentStudent && !sectionCheck) || user.id !== studentId) {
			if (!enrollmentTeacher) {
				res.status(403).send({
					error: `Only a teacher or student for the given course/section can see grades for the course`,
				});
				return;
			}
		}

		// Get the grades for the individual student
		if (enrollmentTeacher) {
			const student = await db.User.findByPk(studentId);
			const grades = await db.Grades.findOne({
				where: {
					sectionId: sectionId,
					userId: studentId,
				},
			});
			if (!grades) {
				res.status(204).send({
					error: `No grades found for student with id ${studentId}`,
				});
				return;
			}

			const grade = grades.grade || 0;
			res.status(200).send({
				studentId: student.id,
				studentName: `${student.firstName} ${student.lastName}`,
				grade: grade,
			});
			return;
		}

		// Return the grade for the individual student
		if (enrollmentStudent) {
			const grades = await db.Grades.findOne({
				where: {
					sectionId: sectionId,
					userId: user.id,
				},
			});
			if (!grades) {
				res.status(204).send({
					error: `No grades found for student with ID ${user.id}`,
				});
				return;
			}

			const grade = grades.grade || 0;
			res.status(200).send({
				studentId: user.id,
				studentName: `${user.firstName} ${user.lastName}`,
				grade: grade,
			});
			return;
		}
	}
);

module.exports = router;
