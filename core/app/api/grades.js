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
const { Op } = require("sequelize");

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
			// get all questions for all lectures in this section
			const allQuestionsInLectures = {};
			for (const lfs of lectureForSections) {
				allQuestionsInLectures[lfs.id] = await db.QuestionInLecture.findAll({
					where: { lectureForSectionId: lfs.id },
					attributes: { exclude: ["LectureId"] }
				});
			}
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
				for (let j = 0; j < lectureForSections.length; j++) {
					const lfs = lectureForSections[j];
					const questionsInLecture = allQuestionsInLectures[lfs.id];
					let lectureGradeObj = {};
					let lectureScore = 0;
					let lectureQuestionsAsked = 0;
					let lectureQuestionsAnswered = 0;
					let lectureTotalPoints = 0;
					// Sum totalPoints for all questions in this lecture
					for (let k = 0; k < questionsInLecture.length; k++) {
						const question = await db.Question.findOne({
							where: { id: questionsInLecture[k].questionId },
						});
						lectureTotalPoints += question.totalPoints || 0;
						totalPoints += question.totalPoints || 0;
						totalQuestionsAsked++;
						lectureQuestionsAsked++;
						// Check if a response exists for this question, this student, and this lectureForSection
						const response = await db.Response.findOne({
							where: {
								enrollmentId: students[i].Enrollments[0].id,
								questionInLectureId: questionsInLecture[k].id
							}
						});
						if (response) {
							lectureQuestionsAnswered++;
							totalQuestionsAnswered++;
						}
					}
					// Get the student's grade for this lecture (if any)
					const grade = await db.Grades.findOne({
						where: {
							enrollmentId: students[i].Enrollments[0].id,
							lectureForSectionId: lfs.id
						}
					});
					if (grade) {
						lectureScore = grade.points;
						totalScore += grade.points;
					}
					lectureGradeObj.lectureId = lfs.lectureId;
					lectureGradeObj.lectureTitle = lfs.Lecture.title;
					lectureGradeObj.lectureGrade = lectureScore; // points received for this lecture
					lectureGradeObj.totalAnswered = lectureQuestionsAnswered;
					lectureGradeObj.totalQuestions = lectureQuestionsAsked;
					lectureGradeObj.totalScore = lectureScore;
					lectureGradeObj.totalPoints = lectureTotalPoints;
					studentGradeObj.lectures.push(lectureGradeObj);
				}
				studentGradeObj.grade = parseFloat(
					(totalScore / (totalPoints || 1)).toFixed(2)
				);
				studentGradeObj.pointScore = parseFloat(
					(totalScore / (totalPoints || 1)).toFixed(2)
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
	// get student grade in the course as well as grade for each indiivudal lecture
	else if (enrollmentStudent && sectionCheck) {
		try {
			let resp = [];
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
			const allQuestionsInLectures = {};
			for (const lfs of lectureForSections) {
				allQuestionsInLectures[lfs.id] = await db.QuestionInLecture.findAll({
					where: { lectureForSectionId: lfs.id },
					attributes: { exclude: ["LectureId"] }
				});
			}
			let totalQuestionsAsked = 0;
			let totalQuestionsAnswered = 0;
			let totalScore = 0;
			let totalPoints = 0;
			for (let j = 0; j < lectureForSections.length; j++) {
				const lfs = lectureForSections[j];
				const questionsInLecture = allQuestionsInLectures[lfs.id];
				let lectureGradeObj = {};
				let lectureScore = 0;
				let lectureQuestionsAsked = 0;
				let lectureQuestionsAnswered = 0;
				let lectureTotalPoints = 0;
				for (let k = 0; k < questionsInLecture.length; k++) {
					const question = await db.Question.findOne({
						where: { id: questionsInLecture[k].questionId },
					});
					lectureTotalPoints += question.totalPoints || 0;
					totalPoints += question.totalPoints || 0;
					totalQuestionsAsked++;
					lectureQuestionsAsked++;
					// Check if a response exists for this question, this student, and this lectureForSection
					const response = await db.Response.findOne({
						where: {
							enrollmentId: enrollmentStudent.id,
							questionInLectureId: questionsInLecture[k].id
						}
					});
					if (response) {
						console.log("\n\n\nfound response for ", questionsInLecture[k].questionId)
						totalQuestionsAnswered++;
						lectureQuestionsAnswered++;

					}else {
						console.log("\n\n\nnot found response for ", questionsInLecture[k].questionId)

					}
				}
				// Get the student's grade for this lecture (if any)
				const studentGrade = await db.Grades.findOne({
					where: {
						enrollmentId: enrollmentStudent.id,
						lectureForSectionId: lfs.id
					}
				});
				if (studentGrade) {
					lectureScore = studentGrade.points;
					totalScore += studentGrade.points;
					console.log(`Lecture ${lfs.lectureId} (${lfs.Lecture.title}): grade.points = ${studentGrade.points}, questions answered (by question check) = ${lectureQuestionsAnswered}`);
				}
				lectureGradeObj.lectureId = lfs.lectureId;
				lectureGradeObj.lectureTitle = lfs.Lecture.title;
				lectureGradeObj.lectureGrade = lectureScore;
				lectureGradeObj.totalAnswered = lectureQuestionsAnswered;
				lectureGradeObj.totalQuestions = lectureQuestionsAsked;
				lectureGradeObj.totalScore = lectureScore;
				lectureGradeObj.totalPoints = lectureTotalPoints;
				resp.push(lectureGradeObj);
			}
			// Log the total number of questions asked and answered for the student
			console.log(`Total questions asked for student ${user.id} (${user.firstName} ${user.lastName}): ${totalQuestionsAsked}`);
			console.log(`Total questions answered for student ${user.id} (${user.firstName} ${user.lastName}): ${totalQuestionsAnswered}`);
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

// endpoint to get the grade of student(s) in a course
// sums the lecture * lecture_weight for each lecture 
// normalized to 0-100 before returning
// URL: /courses/:course_id/sections/:section_id/grades/courseGrade
router.get("/courseGrade", requireAuthentication, async function (req, res, next) {
    try {
        const courseId = parseInt(req.params["course_id"]);
        const sectionId = parseInt(req.params["section_id"]);
        if (isNaN(courseId) || isNaN(sectionId)) {
            return res.status(400).send({ error: "Invalid courseId or sectionId" });
        }
        const user = await db.User.findByPk(req.payload.sub);
        // Check enrollments
        const enrollmentTeacher = await db.Enrollment.findOne({
            where: { userId: user.id, courseId: courseId, role: "teacher" },
        });
        const enrollmentStudent = await db.Enrollment.findOne({
            where: { userId: user.id, sectionId: sectionId, role: "student" },
        });
        // Check section is in course
        const sectionCheck = await db.Section.findOne({
            where: { id: sectionId, courseId: courseId },
        });
        if (!enrollmentTeacher && !(enrollmentStudent && sectionCheck)) {
            return res.status(403).send({
                error: `Only a teacher or student for the given course/section can see grades for the course`,
            });
        }
        // Find all lectures for this section
        const lectureForSections = await db.LectureForSection.findAll({
            where: { sectionId: sectionId, published: true},
        });
        const lectureForSectionIds = lectureForSections.map(lfs => lfs.id);
        // Find all grades for these lectures
        const allGrades = await db.Grades.findAll({
            where: { lectureForSectionId: { [db.Sequelize.Op.in]: lectureForSectionIds } },
        });
        // Find all weights for these lectures
        const weights = await db.LectureGradeWeight.findAll({
            where: { LectureForSectionId: { [db.Sequelize.Op.in]: lectureForSectionIds } },
        });
        const weightMap = {};
        let totalWeight = 0;
        for (const w of weights) {
            weightMap[w.LectureForSectionId] = w.weight;
            totalWeight += w.weight;
        }
        if (totalWeight === 0) totalWeight = 1; // avoid division by zero

        // For each lecture, get max possible points
        const lectureMaxPointsMap = {};
        for (const lfs of lectureForSections) {
            const questions = await db.QuestionInLecture.findAll({
                where: { lectureForSectionId: lfs.id },
            });
            let maxPoints = 0;
            for (const q of questions) {
                const question = await db.Question.findByPk(q.questionId);
                maxPoints += question ? (question.totalPoints || 0) : 0;
            }
            lectureMaxPointsMap[lfs.id] = maxPoints;
        }
        // Helper to calculate normalized grade
        const normalize = (sum, totalWeight) =>
            totalWeight === 0 ? 0 : parseFloat(((sum / totalWeight) * 100).toFixed(2));
        if (enrollmentTeacher) {
            // For the teacher, sum weighted normalized grades for all students
            const students = await db.User.findAll({
                include: [
                    {
                        model: db.Enrollment,
                        required: true,
                        where: { sectionId: sectionId, role: "student" },
                    },
                ],
            });
            const results = [];
            for (const student of students) {
                let weightedSum = 0;
                for (const lfs of lectureForSections) {
                    const grade = allGrades.find(g => g.enrollmentId === student.Enrollments[0].id && g.lectureForSectionId === lfs.id);
                    const points = grade ? grade.points : 0;
                    const maxPoints = lectureMaxPointsMap[lfs.id] || 1;
                    const normalizedLecture = points / maxPoints;
                    const weight = weightMap[lfs.id] || 0;
                    weightedSum += normalizedLecture * weight;
                }
                results.push({
                    studentId: student.id,
                    studentName: `${student.firstName} ${student.lastName}`,
                    courseGrade: parseFloat(((weightedSum / totalWeight) * 100).toFixed(2)),
                });
            }
            return res.status(200).send(results);
        } else if (enrollmentStudent && sectionCheck) {
            // For the student, sum their weighted normalized grades
            let weightedSum = 0;
            for (const lfs of lectureForSections) {
                const grade = allGrades.find(g => g.enrollmentId === enrollmentStudent.id && g.lectureForSectionId === lfs.id);
                const points = grade ? grade.points : 0;
                const maxPoints = lectureMaxPointsMap[lfs.id] || 1;
                const normalizedLecture = points / maxPoints;
                const weight = weightMap[lfs.id] || 0;
                weightedSum += normalizedLecture * weight;
            }
            const normalized = parseFloat(((weightedSum / totalWeight) * 100).toFixed(2));
            return res.status(200).send({
                studentId: user.id,
                studentName: `${user.firstName} ${user.lastName}`,
                courseGrade: normalized,
            });
        }
    } catch (e) {
        console.error("Error in /courseGrade endpoint:", e);
        next(e);
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
					grades.find((grade) =>
						grade.userId === students[i].id) || 0;
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
				const singleGrade = await db.Grades.findOne({
					where: {
						lectureForSectionId: sectionId,
						enrollmentId: user.id,
					},
				});
				if (!singleGrade) {
					res.status(204).send({
						error: `No grades found for student with ID ${user.id}`,
					});
					return;
				}

				const grade = singleGrade.grade || 0;
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
