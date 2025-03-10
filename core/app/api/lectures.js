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

        // create lecture-section association for all sections in course
        const sectionIds = await getSectionsIdsFromCourse(courseId);
        try {
            // iterate through each section in this course and add relationship
            for (let i = 0; i < sectionIds.length; i++) {
                await db.LectureForSection.create({
                    lectureId: lecture.id,
                    sectionId: sectionIds[i]
                })
            }
        }
        catch (e) {
            if (e instanceof ValidationError) {
                return res.status(400).send({error: serializeSequelizeErrors(e)})
            }
            else {
                return res.status(400).send({error: "Unable to create association between lecture & this course' sections"})
            }
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

// get a specific lecture usign lectureId
router.get('/:lecture_id', requireAuthentication, async function (req, res) {
    const user = await db.User.findByPk(req.payload.sub)
    const lectureId = parseInt(req.params['lecture_id'])
    const courseId = parseInt(req.params['course_id'])
    const enrollment = await getEnrollmentFromCourse(user.id, courseId) || await getEnrollmentFromSectionInCourse(user.id, courseId)
    const lecture = await getLecture(lectureId)
    var full_response = {}  // will hold response with lecture info and related questions

    if (enrollment == null) {   // if user is not enrolled in this course
        return res.status(403).send()
    }
    else if (lecture == null) {      // if passed in lectureId does not exist
        return res.status(404).send({error: "Lecture of this id does not exist"})
    }
    else if (enrollment.role == 'teacher') {     // if teacher, send lecture info & all related questions
        try {
            full_response['lecture'] = lecture  // full_response will hold wanted lecture along with its related questions in the end
            const questions_in_lec = await db.sequelize.query(  // raw sql query to get all questions in this lecture using `QuestionInLecture`
                'SELECT q.*, ql.order, ql.published FROM Questions q INNER JOIN QuestionInLectures ql ON q.id = ql.questionId INNER JOIN Lectures l ON ql.lectureId = l.id WHERE l.id = $lectureId ORDER BY ql.order',
                {
                    bind: { lectureId: lectureId },
                    type: db.sequelize.QueryTypes.SELECT
                }
            )
            full_response['questions'] = questions_in_lec
        }
        catch (e) {
            if (e instanceof ValidationError) {
                return res.status(400).send({error: serializeSequelizeErrors(e)})
            }
            else {
                return res.status(400).send({error: "Unable to get lecture or questions"})
            }
        }
        res.status(200).send(full_response)
    }
    else {  // if student, only send published info
        let sectionLectureRelation = await getSectionLectureRelation(lectureId, enrollment.sectionId)
        if (sectionLectureRelation == null) {
            res.status(404).send({error: "This lecture does not exist in your section"})
        }
        else if (!sectionLectureRelation.published) {    // if this lecture (from user's section) isn't published
            res.status(404).send({error: "This lecture is not yet published"})
        }
        else {  // if this lecture (from user's section) is published
            try {
                const lecture = await getLecture(lectureId)
                full_response['lecture'] = lecture
    
                const questions_in_lec = await db.sequelize.query(  // raw sql query to get all published questions in this lecture using `QuestionInLecture`
                    'SELECT q.* FROM Questions q INNER JOIN QuestionInLectures ql ON q.id = ql.questionId INNER JOIN Lectures l ON ql.lectureId = l.id WHERE ql.published = 1 AND l.id = $lectureId',
                    {
                        bind: { lectureId: lectureId },
                        type: db.sequelize.QueryTypes.SELECT
                    }
                )
                full_response['questions'] = questions_in_lec
            }
            catch (e) {
                if (e instanceof ValidationError) {
                    return res.status(400).send({error: serializeSequelizeErrors(e)})
                }
                else {
                    return res.status(400).send({error: "Unable to get lecture or questions"})
                }
            }
            res.status(200).json(full_response)   // all good, return updated lecture object
        }
    }
})

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
