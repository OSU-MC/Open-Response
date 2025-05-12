const router = require('express').Router({ mergeParams: true })
const db = require('../models/index')
const { logger } = require('../../lib/logger')
const lectureService = require('../services/lecture_service')
const enrollmentService = require('../services/enrollment_service')
const { requireAuthentication } = require('../../lib/auth')

// base path: /courses/:course_id/sections/:section_id/lectures


async function getSectionsIdsFromCourse(courseId) {
    const found_sections = await db.Section.findAll({
        where: { courseId: courseId },
        attributes: ['id']
    })

    // extract ids of returned sections
    let section_ids = []
    for (let i = 0; i < found_sections.length; i++) {
        section_ids.push(found_sections[i].id)     
    }

    return section_ids
}

async function getEnrollmentFromSectionInCourse(userId, courseId) {
    const sectionIds = await getSectionsIdsFromCourse(courseId);
    const enrollment = await db.Enrollment.findOne({
        where: {
            userId: userId,
            sectionId: sectionIds
        }
    })
    return enrollment;
}

async function getAccessibleSectionAndLectures(userId, courseId) {
    let enrollment = await getEnrollmentFromSectionInCourse(userId, courseId);
    if (!enrollment) {
        return null;
    }
    const sectionId = enrollment.SectionId;
    
    const lecturesForSection = await db.LectureForSection.findAll({
        where: {
            sectionId: sectionId,
            published: true
        },
        attributes: ['lectureId']
    });
    
    const lectureIds = lecturesForSection.map(lfs => lfs.lectureId);
    return {
        sectionId: sectionId,
        lectureIds: lectureIds
    };
}


// get a student's live lecture if one is live
router.get('/live', requireAuthentication, async function (req, res, next) {
    const courseId = parseInt(req.params['course_id']);
    const userId = parseInt(req.params['section_id']); // sneakily used here

    try {
        const sectionData = await getAccessibleSectionAndLectures(userId, courseId);
        if (!sectionData) {
            return res.status(403).send({ error: "User is not enrolled in this course." });
        }

        const lectureForSections = await db.LectureForSection.findAll({
            where: {
                sectionId: sectionData.sectionId,
                published: true
            },
            include: [{
                model: db.Lecture,
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }]
        });

        const liveLectureSections = lectureForSections.filter(lfs => lfs.dataValues.isLive);

        if (lectureForSections.length === 0) {
            return res.status(404).send({ error: "No live lectures found in this course and section." });
        }

        const liveLecture = liveLectureSections[0]?.dataValues;
        if (!liveLecture) {
            return res.status(404).send({ error: "No live lecture data found." });
        }
        const filteredLecture = {
            name: liveLecture.Lecture.dataValues.title,
            id: liveLecture.id,
            isLive: liveLecture.isLive,
            closedAt: liveLecture.closedAt,
        };

        res.status(200).send({ filteredLecture });
    } catch (err) {
        console.error("Error retrieving live lecture for section:", err);
        next(err);
    }
});

// get all lectures in section
router.get('/', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub);
    const courseId = parseInt(req.params['course_id']);
    const sectionId = parseInt(req.params['section_id']);

    try {
        const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId);
        if (!isTeacher) {
            return res.status(403).send({ error: "Must be a teacher of this course to view lectures" });
        }

        const section = await db.Section.findOne({
            where: { id: sectionId, courseId: courseId },
        });
        if (!section) {
            return res.status(404).send({ error: "Section not found or does not belong to the course" });
        }

        const lectureForSections = await db.LectureForSection.findAll({
            where: { sectionId: sectionId },
            include: [{
                model: db.Lecture,
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            }],
        });

        const lectures = lectureForSections.map(entry => ({
            ...entry.Lecture.dataValues,
            attendanceMethod: entry.attendanceMethod,
            published: entry.published,
            isLive: entry.isLive
        }));

        res.status(200).send({ lectures });
    } catch (err) {
        console.error("Error retrieving lectures for section:", err);
        next(err);
    }
});

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
});

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

// Update a lecture's live status
router.put('/:lecture_id/live/:live_status', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub)
    const courseId = parseInt(req.params['course_id'])
    const sectionId = parseInt(req.params['section_id'])
    const lectureId = parseInt(req.params['lecture_id'])
    const liveStatus = req.params['live_status'] === '1';



    try {
        const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId)
        if (isTeacher) {
            const lectureForSection = await db.LectureForSection.findOne({
                where: {
                        LectureId: lectureId,
                        SectionId: sectionId
                    }
                });            
            if (lectureForSection) {
                await lectureForSection.update({ isLive: liveStatus, published: true });
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