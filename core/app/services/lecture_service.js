const { extractValidFields, validateAgainstSchema } = require('../../lib/validator')
const db = require('../models/index')

const lectureInsertSchema = {
    courseId: {required: true},
    title: {required: true},
    order: {required: false},
    description: {required: false}
}

const lectureUpdateSchema = {
    title: {required: false},
    order: {required: false},
    description: {required: false}
}

exports.extractLectureUpdateFields = (body) => {
    return extractValidFields(body, lectureUpdateSchema)
}

exports.validateLectureCreationRequest = (body) => {
    return validateAgainstSchema(body, lectureInsertSchema)
}

exports.getLectureInCourse = async (lectureId, courseId) => {
    return await db.Lecture.findOne({
        where: {
            id: lectureId,
            courseId: courseId
        }
    })
}

exports.getLectureForSection = async (sectionId, lectureId) => {
    return await db.LectureForSection.findOne({
        where: {
            lectureId: lectureId,
            sectionId: sectionId
        }
    })
}
