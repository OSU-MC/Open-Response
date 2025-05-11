const router = require('express').Router({ mergeParams: true })
const db = require('../models/index')
const { logger } = require('../../lib/logger')
const lectureService = require('../services/lecture_service')
const enrollmentService = require('../services/enrollment_service')
const { requireAuthentication } = require('../../lib/auth')

// base path: /courses/:course_id/sections/:section_id/lectures

// (un)publish a lecture in a section
router.put('/:lecture_id', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub) // find user by ID, which is stored in sub
    const courseId = parseInt(req.params['course_id'])
    const sectionId = parseInt(req.params['section_id'])
    const lectureId = parseInt(req.params['lecture_id'])

    try {
        const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId)
        if (isTeacher) {
            const foundSection = await db.Section.findByPk(sectionId)
            if (foundSection) {
                if (foundSection.courseId == courseId) {
                    const foundLectureInSection = await lectureService.getLectureForSection(sectionId, lectureId)
                    if (foundLectureInSection) {
                        const updatePublishedTo = !(foundLectureInSection.published)    // get opposite bool of current published status
                        await foundLectureInSection.update({published: updatePublishedTo})
                        res.status(200).send()
                    }
                    else {  // no relationship between given lecture and section
                        res.status(400).send({error: `No relationship between lecture of id ${lectureId} and section of id ${sectionId}`})
                    }
                }
                else {  // given section is not in this course
                    res.status(400).send({error: `Section of id ${sectionId} is not in course of id ${courseId}`})
                }
            }
            else {  // section id is not valid
                res.status(404).send({error: `No section of id ${sectionId} was found`})
            }
        }
        else {  // user is not a teacher
            res.status(403).send({error: "Must be a teacher of this course to publish lecture"})
        }

    }
    catch (e) {
        next(e)
    }
})

// Get all of the questions from a lectureForSection
router.get('/:lecture_id/questions', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
    const courseId = parseInt(req.params['course_id']);
    const sectionId = parseInt(req.params['section_id']);
    const lectureId = parseInt(req.params['lecture_id']);
    try {
       
        // Check if the user is a teacher for the course
        const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId);

        if (!isTeacher) {
            return res.status(403).send({ error: "Must be a teacher of this course to get questions from a lecture" });
        }

        // Validate the section exists and belongs to the course
        const section = await db.Section.findOne({
            where: { id: sectionId, courseId: courseId },
        });

        if (!section) {
            return res.status(404).send({ error: "Section not found or does not belong to the course" });
        }

        // Validate the lecture exists and belongs to the course
        const lecture = await db.Lecture.findOne({
            where: { id: lectureId, courseId: courseId },
        });

        if (!lecture) {
            return res.status(404).send({ error: "Lecture not found or does not belong to the course" });
        }

        // Find the LectureForSection object
        const lectureForSection = await db.LectureForSection.findOne({
            where: { sectionId: sectionId, lectureId: lectureId },
        });

        if (!lectureForSection) {
            return res.status(404).send({ error: "LectureForSection not found" });
        }

        // Find all the questions associated with the lectureForSectionId
        const questionInLectureRecords = await db.QuestionInLecture.findAll({
            where: { lectureForSectionId: lectureForSection.id },
            attributes: ['questionId'], // Only fetch the questionId
        });


        // Extract the questionIds from the results
        const questionIds = questionInLectureRecords.map(record => record.questionId);


        // Fetch the actual Question objects using the extracted questionIds
        const questions = await db.Question.findAll({
            where: {
                id: questionIds,
            },
            attributes: { exclude: ['LectureId'] },
        });

        res.status(200).send({ questions });
    } catch (error) {
        console.error("Error getting questions from lectureForSection:", error);
        return res.status(500).send({ error: "Internal server error" });
    }
});


// Add a lecture to a section
router.post('/', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
    const courseId = parseInt(req.params['course_id']);
    const sectionId = parseInt(req.params['section_id']);
    const { lectureId: selectedLectureId, attendanceMethod: selectedAttendanceMethod } = req.body;

    // Validate the parameters
    if (!courseId || !sectionId || !selectedLectureId || !selectedAttendanceMethod) {
        return res.status(400).send({ error: "Missing required parameters: courseId, sectionId, or lectureId" });
    }

    try {
        // Check if the user is a teacher for the course
        const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId);
        if (!isTeacher) {
            return res.status(403).send({ error: "Must be a teacher of this course to add a lecture to a section" });
        }

        // Validate the section exists and belongs to the course
        const section = await db.Section.findOne({
            where: { id: sectionId, courseId: courseId },
        });
        if (!section) {
            return res.status(404).send({ error: "Section not found or does not belong to the course" });
        }

        // Validate the lecture exists and belongs to the course
        const lecture = await db.Lecture.findOne({
            where: { id: selectedLectureId, courseId: courseId },
        });
        if (!lecture) {
            return res.status(404).send({ error: "Lecture not found or does not belong to the course" });
        }

        const existingLectureForSection = await db.LectureForSection.findOne({
            where: { sectionId: sectionId, lectureId: selectedLectureId },
        });
        if (existingLectureForSection) {
            return res.status(400).send({ error: "Lecture already exists in this section" });
        }

        // Create the association between the lecture and the section
        const lectureForSection = await db.LectureForSection.create({
            sectionId: sectionId,
            lectureId: selectedLectureId,
            attendanceMethod: selectedAttendanceMethod,
            published: false,
        });

        // Find all the questions associated with the lectureId
        const questionsInLecture = await db.Question.findAll({
            where: { lectureId: selectedLectureId },
        });

        // Create questionsInLecture with lectureForSectionId
        for (const question of questionsInLecture) {
            await db.QuestionInLecture.create({
                lectureForSectionId: lectureForSection.id,
                questionId: question.id,
                published: false,
            });
        }

        res.status(200).send(lectureForSection);
    } catch (error) {
        console.error("Error adding lecture to section:", error);
        next(error);
    }
});

// Delete a LectureForSection object
router.delete('/:lecture_id', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub); // find user by ID, which is stored in sub
    const courseId = parseInt(req.params['course_id']);
    const sectionId = parseInt(req.params['section_id']);
    const lectureId = parseInt(req.params['lecture_id']);

    try {
        // Validate the section exists and belongs to the course
        const section = await db.Section.findOne({
            where: { id: sectionId, courseId: courseId },
        });
        if (!section) {
            return res.status(404).send({ error: "Section not found or does not belong to the course" });
        }

        // Validate the lecture exists and belongs to the course
        const lecture = await db.Lecture.findOne({
            where: { id: lectureId, courseId: courseId },
        });
        if (!lecture) {
            return res.status(404).send({ error: "Lecture not found or does not belong to the course" });
        }

        // Find and delete the LectureForSection object
        const lectureForSection = await db.LectureForSection.findOne({
            where: { sectionId: sectionId, lectureId: lectureId },
        });
        if (!lectureForSection) {
            return res.status(404).send({ error: "LectureForSection not found" });
        }

        await lectureForSection.destroy();
        res.status(200).send({ message: "LectureForSection deleted successfully" });
    } catch (error) {
        console.error("Error deleting LectureForSection:", error);
        next(error);
    }
});

router.put('/:lecture_id/live', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub)
    const courseId = parseInt(req.params['course_id'])
    const sectionId = parseInt(req.params['section_id'])
    const lectureId = parseInt(req.params['lecture_id'])

    try {
        const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId)
        if (isTeacher) {
            const foundLecture = await db.Lecture.findByPk(lectureId)
            if (foundLecture) {
                const { isLive = false, published } = req.body
                await foundLecture.update({ isLive, published })
                res.status(200).send({ message: "Live status updated" })
            } else { //no lecture
                res.status(404).send({ error: "Lecture not found" })
            }
        } else { //user is not a teacher
            res.status(403).send({ error: "User must be a teacher to update the lecture" })
        }
    } catch (e) {
        next(e)
    }
})



module.exports = router