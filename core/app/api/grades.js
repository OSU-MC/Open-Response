const router = require("express").Router({ mergeParams: true });
const db = require("../models/index");
const { requireAuthentication } = require("../../lib/auth");
const { serializeSequelizeErrors } = require("../../lib/string_helpers");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const questionService = require("../services/question_service");
const responseService = require("../services/response_service");
const csv = require('csv-parser');
const fs = require('fs');
const { Parser } = require('json2csv');

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
			const lectureForSections = await db.LectureForSection.findAll({
				where: {
					sectionId: sectionId,
					published: true,
				},
				include: [
					{
						model: db.Lecture,
						required: true,
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
				for (let j = 0; j < lectureForSections.length; j++) {
					// get all the questions asked during the lecture
					const questionsInLecture = await db.QuestionInLecture.findAll({
						where: {
							lectureForSectionId: lectureForSections[j].id,
						},
						attributes: { exclude: ["LectureId"] }
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
					lectureGradeObj.lectureId = lectureForSections[j].lectureId;
					lectureGradeObj.lectureTitle = lectureForSections[j].Lecture.title;
					lectureGradeObj.lectureGrade = lectureScore 
					
					// lectureGradeObj.lectureGrade = parseFloat(
					// 	(lectureScore / lectureQuestionsAsked).toFixed(2)
					// );
					lectureGradeObj.totalAnswered = lectureQuestionsAnswered;
					lectureGradeObj.totalQuestions = lectureQuestionsAsked;
					lectureGradeObj.totalScore = lectureScore;
					lectureGradeObj.totalPoints = totalPoints;
					lectureGradeObj.points = points;
					studentGradeObj.lectures.push(lectureGradeObj);
				}
				studentGradeObj.grade = parseFloat(
					(totalScore / totalQuestionsAsked).toFixed(2)
				);
				studentGradeObj.pointScore = parseFloat(
					(totalScore / totalQuestionsAsked).toFixed(2)
				);
				studentGradeObj.totalQuestions = totalQuestionsAsked;
				studentGradeObj.totalAnswered = totalQuestionsAnswered;
				studentGradeObj.totalScore = totalScore;
				resp.push(studentGradeObj);
			}

			res.status(200).send(resp);
		} catch (e) {
			console.error("Error fetching grades for teacher:", e);
			next(e);
		}
	}
	// get student grade in the course as well as grade for each indiivdual lecture
	else if (enrollmentStudent && sectionCheck) {
		try {
			let resp = [];

			// get lectures for the section
			const lectureForSections = await db.LectureForSection.findAll({
				where: {
					sectionId: sectionId,
					published: true,
				},
				include: [
					{
						model: db.Lecture,
						required: true,
					},
				],
			});

			let totalScore = 0;
			let totalQuestionsAsked = 0;
			let totalQuestionsAnswered = 0;
			// for each lecture in the section
			for (let j = 0; j < lectureForSections.length; j++) {
				// get all the questions asked during the lecture
				const questionsInLecture = await db.QuestionInLecture.findAll({
					where: {
						lectureForSectionId: lectureForSections[j].id,
					},
					attributes: { exclude: ["LectureId"] }
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

				lectureGradeObj.lectureId = lectureForSections[j].lectureId; // Add lectureTitleId
				lectureGradeObj.lectureTitle = lectureForSections[j].Lecture.title; // Add lectureTitle
				lectureGradeObj.lectureGrade = lectureScore
				// lectureGradeObj.lectureGrade = parseFloat(
				// 	(lectureScore / lectureQuestionsAsked).toFixed(2) // ratio of score to questions asked
				// );
				// lectureGradeObj.totalAnswered = lectureQuestionsAnswered;
				lectureGradeObj.totalQuestions = lectureQuestionsAsked;
				lectureGradeObj.totalScore = lectureScore;
				resp.push(lectureGradeObj);
			}

			res.status(200).send(resp);
		} catch (e) {
			console.error("Error fetching grades for student:", e);
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
		try {
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
					lectureForSectionId: sectionId,
				},
                attributes: { exclude: ["lectureForSectionId"] }
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
		} catch (e) {
			console.error("Error fetching all grades for teacher:", e);
			next(e);
		}
		return;
	}

	// Return the grade for the individual student
	if (enrollmentStudent) {
		try {
			const grades = await db.Grades.findAll({
				where: {
					lectureForSectionId: sectionId,
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
		} catch (e) {
			console.error("Error fetching all grades for student:", e);
			next(e);
		}
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
			try {
				const student = await db.User.findByPk(studentId);
				const grades = await db.Grades.findOne({
					where: {
						lectureForSectionId: sectionId,
						enrollmentId: studentId,
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
			} catch (e) {
				console.error("Error fetching grades for individual student by teacher:", e);
				next(e);
			}
			return;
		}

		// Return the grade for the individual student
		if (enrollmentStudent) {
			try {
				const grades = await db.Grades.findOne({
					where: {
						lectureForSectionId: sectionId,
						enrollmentId: user.id,
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
			} catch (e) {
				console.error("Error fetching grades for individual student:", e);
				next(e);
			}
			return;
		}
	}
);

// // URL: /courses/:course_id/sections/:section_id/grades/export
// router.get("/export", requireAuthentication, async function (req, res, next) {
// 	const courseId = parseInt(req.params["course_id"]);
// 	const sectionId = parseInt(req.params["section_id"]);

// 	try {
// 		const grades = await db.Grade.findAll({
// 			where: { sectionId },
// 			include: [
// 				{
// 					model: db.User,
// 					as: 'student',
// 					attributes: ['firstName', 'lastName']
// 				},
// 				{
// 					model: db.Lecture,
// 					attributes: ['title']
// 				}
// 			]
// 		});

// 		const fields = ['student.firstName', 'student.lastName', 'lecture.title', 'grade'];
// 		const json2csvParser = new Parser({ fields });
// 		const csv = json2csvParser.parse(grades);

// 		res.header('Content-Type', 'text/csv');
// 		res.attachment('grades.csv');
// 		res.send(csv);
// 	} catch (e) {
// 		console.error("Error exporting grades:", e);
// 		next(e);
// 	}
// });

// // URL: /courses/:course_id/sections/:section_id/grades/import
// router.post("/import", requireAuthentication, async function (req, res, next) {
// 	const courseId = parseInt(req.params["course_id"]);
// 	const sectionId = parseInt(req.params["section_id"]);

// 	if (!req.files || !req.files.file) {
// 		return res.status(400).send({ error: 'No file uploaded' });
// 	}

// 	const file = req.files.file;
// 	const grades = [];

// 	fs.createReadStream(file.tempFilePath)
// 		.pipe(csv())
// 		.on('data', (row) => {
// 			grades.push(row);
// 		})
// 		.on('end', async () => {
// 			try {
// 				for (const grade of grades) {
// 					const student = await db.User.findOne({
// 						where: {
// 							firstName: grade['student.firstName'],
// 							lastName: grade['student.lastName']
// 						}
// 					});

// 					const lecture = await db.Lecture.findOne({
// 						where: {
// 							title: grade['lecture.title'],
// 							courseId
// 						}
// 					});

// 					if (student && lecture) {
// 						await db.Grade.create({
// 							studentId: student.id,
// 							lectureId: lecture.id,
// 							sectionId,
// 							grade: grade.grade
// 						});
// 					}
// 				}
// 				res.status(200).send({ message: 'Grades imported successfully' });
// 			} catch (e) {
// 				console.error("Error importing grades:", e);
// 				next(e);
// 			}
// 		});
// });

module.exports = router;
