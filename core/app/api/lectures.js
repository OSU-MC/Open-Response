const router = require('express').Router({ mergeParams: true })
const db = require('../models/index')
const { requireAuthentication } = require('../../lib/auth')
const { serializeSequelizeErrors } = require('../../lib/string_helpers')
const { UniqueConstraintError, ValidationError } = require('sequelize')
const lectureService = require('../services/lecture_service')

// base path: /courses/:course_id/lectures

// get user's enrollment from using their id and current courseId
async function getEnrollmentFromCourse(userId, courseId) {
    return await db.Enrollment.findOne({
        where: {
            userId: userId,
            courseId: courseId
        }
    })
}

// given a courseId, find all related sections and get the
// enrollments of those sections from current user (primarily
// used to get the enrollment of a student bc students cannot 
// enrolled at course level)
async function getEnrollmentFromSectionInCourse(userId, courseId) {
    return await db.Enrollment.findOne({
        where: {
            userId: userId,
            sectionId: await getSectionsIdsFromCourse(courseId)
        }
    })
}





async function getCourse(courseId) {
    return await db.Course.findOne({
        where: { id: courseId }
    })
}

async function getLecture(lectureId) {
    return await db.Lecture.findOne({
        where: { id: lectureId }
    })
}

// return the section ids from a course
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

async function getSectionLectureRelation (lectureId, sectiondId) {
    return await db.LectureForSection.findOne({
        where: {
            lectureId: lectureId,
            sectionId: sectiondId
        }
    })
}

// get all lecture objects for the current course
router.get('/', requireAuthentication, async function (req, res) {
    const user = await db.User.findByPk(req.payload.sub)
    const courseId = parseInt(req.params['course_id'])   
    const enrollment = await getEnrollmentFromCourse(user.id, courseId) || await getEnrollmentFromSectionInCourse(user.id, courseId)
    const course = await getCourse(courseId)

    if (enrollment == null) {   // if user is not enrolled in this course
        res.status(403).send()
    }
    else if (enrollment.role == 'student' && !course.published) {   // if user is a student, and course isn't published, return 'No Content'
        res.status(204).send()
    }
    // if student and published get all lectures that are published their section
    else if (enrollment.role == 'student' && course.published) {   // if user is a student, and course is published
        // find the section that user is enrolled in
        const sectionId = enrollment.sectionId;

        // get lectures from LectureForSection using sectionId and published = true
        const lecturesForSection = await db.LectureForSection.findAll({
            where: {
            sectionId: sectionId,
            published: true
            },
            include: {
            model: db.Lecture,
            attributes: ['id', 'title', 'description', 'order', 'courseId'],
            }
        });

        if (lecturesForSection.length === 0) {   // if no lectures are published for this section
            res.status(204).send();
        } else {
            res.status(200).json({
                "lectures": lecturesForSection.map(lfs => lfs.Lecture)
            });
        }
    }
    else {  // if teacher, OR student in published course
        const lectures = await db.Lecture.findAll({
            where: { courseId: courseId },
            include: {
                model: db.LectureForSection,
                attributes: ['published', 'id']
            }
        })
        //get the lectures for section as well

        if (lectures == []) {   // if no lectures are in this course
            res.status(204).send()
        }
        else {
            res.status(200).json({
                "lectures": lectures
            })
        }
    }
})

// create a new lecture within a course
router.post('/', requireAuthentication, async function (req, res) {
    const user = await db.User.findByPk(req.payload.sub)
    const courseId = parseInt(req.params['course_id'])
    const enrollment = await getEnrollmentFromCourse(user.id, courseId) || await getEnrollmentFromSectionInCourse(user.id, courseId)
    var lecture     // will hold the returned lecture object from database

    if (enrollment == null) {   // if user is not enrolled in this course
        res.status(403).send()
    }
    else if (enrollment.role == 'teacher') {
        // create lecture object
        let newLec = req.body
        newLec['courseId'] = courseId
        const missingFields = lectureService.validateLectureCreationRequest(newLec)     // find any required missing fields, if any
        if (missingFields.length == 0) {
            try {
                lecture = await db.Lecture.create(newLec)
            }
            catch (e) {
                if (e instanceof UniqueConstraintError) {
                    return res.status(400).send({error: "There exists a lecture with this order number in this course"})
                }
                else if (e instanceof ValidationError) {
                    return res.status(400).send({error: serializeSequelizeErrors(e)})
                }
                else {
                    return res.status(400).send({error: "Unable to create lecture"})
                }
            }
        }
        else {
            return res.status(400).send({error: `Missing required lecture fields: ${missingFields}`})
        }

        res.status(201).json(lecture)   // all good, return lecture object
    }
    else {      // if user is not a teacher
        res.status(403).send()
    }
})

// update fields of a specific lecture
router.put('/:lecture_id', requireAuthentication, async function (req, res) {
    const user = await db.User.findByPk(req.payload.sub)
    const lectureId = parseInt(req.params['lecture_id'])
    const courseId = parseInt(req.params['course_id'])
    const enrollment = await getEnrollmentFromCourse(user.id, courseId) || await getEnrollmentFromSectionInCourse(user.id, courseId)
    const lecture = await getLecture(lectureId)
    
    if (lecture == null) {  // if passed in lectureId does not exist
        res.status(404).send({error: "Lecture of this id does not exist"})
    }
    else if (enrollment == null) {   // if user is not enrolled in this course
        res.status(403).send()
    }
    else if (enrollment.role == 'teacher') {
        try {
            await db.Lecture.update(
                lectureService.extractLectureUpdateFields(req.body),    // extract title, order, description from body (the updateable fields)
                { where: { id: lectureId } }
            )
        }
        catch (e) {
            if (e instanceof UniqueConstraintError) {
                return res.status(400).send({error: "There exists a lecture with this order number in this course"})
            }
            else if (e instanceof ValidationError) {
                return res.status(400).send({error: serializeSequelizeErrors(e)})
            }
            else {
                return res.status(400).send({error: "Unable to update lecture object"})
            }
        }
        res.status(200).send()   // all good, return updated lecture object
    }
    else {      // if user is not a teacher
        res.status(403).send()
    }
})

// get a specific lecture using lectureId
router.get('/:lecture_id', requireAuthentication, async function (req, res) {
    try {
        const user = await db.User.findByPk(req.payload.sub);
        const lectureId = parseInt(req.params['lecture_id']);
        const courseId = parseInt(req.params['course_id']);
        const enrollment = await getEnrollmentFromCourse(user.id, courseId) || await getEnrollmentFromSectionInCourse(user.id, courseId);
        const lecture = await getLecture(lectureId);
        var full_response = {}; // will hold response with lecture info and related questions

        if (enrollment == null) {   // if user is not enrolled in this course
            return res.status(403).send();
        } else if (lecture == null) {      // if passed in lectureId does not exist
            return res.status(404).send({ error: "Lecture of this id does not exist" });
        }

        if (enrollment.role === 'student') {
            try {
                // Get the section of courseId that this student is enrolled in
                const sectionId = enrollment.sectionId;

                // Get the lecture for section using sectionId and lectureId
                const lectureForSection = await db.LectureForSection.findOne({
                    where: {
                        sectionId: sectionId,
                        lectureId: lectureId,
                        published: true
                    }
                });

                if (!lectureForSection) {
                    return res.status(404).send(); // Lecture is not published for this section
                }

                // find the questionInLectures objects using lectureForSection that are published
                // First, find all QuestionInLecture entries for the given lectureForSectionId
                const questionInLectureIds = await db.QuestionInLecture.findAll({
                    where: {
                        lectureForSectionId: lectureForSection.id,
                        published: true
                    },
                    attributes: ['questionId'] // Only fetch the questionId
                });

                // Extract the questionIds from the results
                const questionIds = questionInLectureIds.map(qil => qil.questionId);

                // Then, fetch the actual Question objects using the extracted questionIds
                const questions = await db.Question.findAll({
                    where: {
                        id: questionIds
                    },
                    attributes: { exclude: ['LectureId'] }
                });

                // extract the published questions
                full_response['lecture'] = lecture; // include lecture details         
                full_response['questions'] = questions; // Use the fetched questions
                return res.status(200).send(full_response);
            } catch (e) {
                console.error("Error fetching lecture or questions for student:", e);
                if (e instanceof ValidationError) {
                    return res.status(400).send({ error: serializeSequelizeErrors(e) });
                } else {
                    return res.status(500).send({ error: "Unable to fetch lecture or questions for student" });
                }
            }
        }
        try {
            full_response['lecture'] = lecture;  // full_response will hold wanted lecture along with its related questions
            
            // Fetch all questions where lectureId matches the provided lecture_id
            const questions = await db.Question.findAll({
                where: { lectureId },
            });
            full_response['questions'] = questions;
        } catch (e) {
            console.error("Error fetching lecture or questions:", e);
            if (e instanceof ValidationError) {
                return res.status(400).send({ error: serializeSequelizeErrors(e) });
            } else {
                return res.status(500).send({ error: "Unable to fetch lecture or questions" });
            }
        }
        res.status(200).send(full_response);
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).send({ error: "An unexpected error occurred" });
    }
});

// delete lecture and ALL relations to this lecture
router.delete('/:lecture_id', requireAuthentication, async function (req, res) {
    const user = await db.User.findByPk(req.payload.sub)
    const lectureId = parseInt(req.params['lecture_id'])
    const courseId = parseInt(req.params['course_id'])
    const enrollment = await getEnrollmentFromCourse(user.id, courseId) || await getEnrollmentFromSectionInCourse(user.id, courseId)
    const lecture = await getLecture(lectureId)
    
    if (lecture == null) {   // if passed in lectureId does not exist
        return res.status(204).send()
    }
    else if (enrollment == null) {   // if user is not enrolled in this course
        return res.status(403).send()
    }
    else if (enrollment.role != 'teacher') {
        return res.status(403).send()
    }
    else {  // if user is a teacher
        try {
            await db.Lecture.destroy({  // delete from lecture table
                where: {
                    id: lectureId
                }
            })
            // cascade will remove all relationships with this lecture as well
        }
        catch (e) {
            if (e instanceof ValidationError) {
                return res.status(400).send({error: serializeSequelizeErrors(e)})
            }
            else {
                return res.status(400).send({error: "Unable to delete lecture"})
            }
        }
        res.status(204).send()
    }
})



router.use('/:lecture_id/questions', require('./questionsInLecture'))

module.exports = router
