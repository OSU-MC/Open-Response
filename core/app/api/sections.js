const router = require('express').Router({ mergeParams: true })
const db = require('../models/index')
const { logger } = require('../../lib/logger')
const sectionService = require('../services/section_service')
const enrollmentService = require('../services/enrollment_service')
const { requireAuthentication } = require('../../lib/auth')
const { ValidationError, UniqueConstraintError } = require('sequelize')

async function getSection(sectionId) {
    return await db.Section.findOne({
        where: {
            id: sectionId
        }
    })
}

async function getSectionsInCourse(courseId) {
    return await db.Section.findAll({
        where: {
            courseId: courseId
        }
    })
}

async function getLecturesFromSection(sectionId) {
    let foundLectures = await db.Lecture.findAll({
        include: [{
            model: db.LectureForSection,
            include: [{
                model: db.Section,
                where: { id: sectionId },
                required: true
            }],
            attributes: ['published'],  // return only published column from the join
            required: true
        }],
        attributes: { exclude: ['CourseId'] }   // exclude duplicate CourseId field from join
    })

    // bring the published attribute up to same level as other attributes
    for (let i = 0; i < foundLectures.length; i++) {
        if (foundLectures[i].LectureForSections.length == 1) {  // SHOULD always be true, given query above
            foundLectures[i].dataValues['published'] = foundLectures[i].LectureForSections[0].published     // bring published attr up
            delete foundLectures[i].dataValues.LectureForSections   // remove unneccesary LectureForSection object from response
        }
    }
    return foundLectures
}

// add new section to course
router.post('/', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub) // find user by ID, which is stored in sub
    const courseId = parseInt(req.params['course_id'])

    // make sure the user creating this section is the teacher for the course
    const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId)

    if (req.body.number && isTeacher) {     // if course number was passed in, and user is teacher
        const sectionToInsert = {
            courseId: parseInt(req.params['course_id']),
            number: req.body.number
        }
        try {
            const section = await db.Section.create(sectionToInsert)
            res.status(201).send({
                section: sectionService.extractSectionFields(section)
            })
        } catch (e) {
            if (e instanceof UniqueConstraintError) {
                res.status(400).send({
                    error: "A section in this course with this section number already exists"
                })
            }
            else if (e instanceof ValidationError) {
                // this will happen if a randomly generated join code is not unique
                next(e)
            }
            else {
                logger.error(e)
                res.status(500).send({error: "An unexpected error occured. Please try again"})
            }
        }
    } else {
        if (isTeacher) {    // user is teacher, problem is that number wasn't passed in
            res.status(400).send({error: `Request did not contain required fields to create a section`})
        }
        else if (req.body.number) {     // number is passed in, problem is that user isn't teacher
            res.status(403).send({error: `Only the teacher for a course can create a section`})
        }
        else {
            res.status(403).send({error: `Request did not contain required fields to create a section and user does not have credentials to do so anyways`})
        }
    }
})

// get all sections within a course
router.get('/', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub) // find user by ID, which is stored in sub
    const courseId = parseInt(req.params['course_id'])

    const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId)

    if (isTeacher) {
        try {
            const sectionsInCourse = await getSectionsInCourse(courseId)
            if (sectionsInCourse.length != 0) {     // if sections are present for this course
                res.status(200).send(sectionsInCourse)
            }
            else {
                res.status(204).send()  // no sections for this course
            }
        }
        catch (e) {
            next(e)
        }
    }
    else {
        res.status(403).send({error: "Only the teacher for a course can get a section"})
    }
})

// get a specific section, and lectures for that section
router.get('/:section_id', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub) // find user by ID, which is stored in sub
    const courseId = parseInt(req.params['course_id'])
    const sectionId = parseInt(req.params['section_id'])

    const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId)
    const respObj = {}  // will hold the full endpoint response at the end

    if (isTeacher) {
        try {
            const foundSection = await getSection(sectionId)
            if (foundSection != null) {     // if section was found for given id
                if (foundSection.courseId == courseId) {
                    respObj['section'] = foundSection
                    const relatedLectures = await getLecturesFromSection(sectionId)   // get lectures and append to response
                    respObj['lectures'] = relatedLectures
                    res.status(200).send(respObj)
                }
                else {
                    res.status(400).send({error: "This section does not belong to the given course"})
                }
            }
            else {
                res.status(404).send({error: "There is no section for the provided section id"})
            }
        }
        catch (e) {
            next(e)
        }
    }
    else {
        res.status(403).send({error: "Must be a teacher of this course to get section info"})
    }
})

// update a specific section
router.put('/:section_id', requireAuthentication, async function (req, res, next) {
    const user = await db.User.findByPk(req.payload.sub) // find user by ID, which is stored in sub
    const courseId = parseInt(req.params['course_id'])
    const sectionId = parseInt(req.params['section_id'])
    const newNumber = req.body.number

    const isTeacher = await enrollmentService.checkIfTeacher(user.id, courseId)
    const foundSection = await getSection(sectionId)

    if (isTeacher) {
        if (foundSection != null) {
            if (foundSection.courseId == courseId) {
                if (newNumber != null && newNumber != "") {   // number is the only field that can be updated, so enforce that it is present and valid
                    try {
                        await db.Section.update(
                            { number: newNumber },
                            { where: { id: sectionId } }
                        )
                        res.status(200).send()
                    }
                    catch (e) {
                        if (e instanceof UniqueConstraintError) {
                            res.status(400).send({
                                error: "A section in this course with this section number already exists"
                            })
                        }
                        else if (e instanceof ValidationError) {
                            res.status(400).send({error: serializeSequelizeErrors(e)})
                        }
                        else {
                            next(e)
                        }
                    }
                }
                else {  // user didn't enter a number
                    res.status(400).send({
                        error: "Must enter a valid number field. Number is the only field that can be updated"
                    })
                }
            }
            else {
                res.status(400).send({error: "This section does not belong to the given course"})
            }
        }
        else {  // foundSection is null
            res.status(404).send({error: "There is no section for the provided section id"})
        }
    }
    else {  // user is not teacher
        res.status(403).send({error: "Must be a teacher of this course to update section"})
    }
})

router.use('/:section_id/lectures', require('./lectureForSection'))

module.exports = router