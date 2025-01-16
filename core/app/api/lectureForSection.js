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

module.exports = router