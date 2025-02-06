const { extractValidFields, validateAgainstSchema } = require('../../lib/validator')

const courseInformationSchema = {
    id: {required: true},
    name: {required: true},
    description: {required: false},
    published: {required: false}
}

const courseStudentInformationSchema = {
    id: {required: true},
    name: {required: true},
    description: {required: false},
    published: {required: false},
    Sections: {required: false}
}

const courseInsertSchema = {
    name: {required: true},
    description: {required: false},
    published: {required: false}
}

exports.extractCourseFields = (body) => {
    return extractValidFields(body, courseInformationSchema)
}

exports.extractCourseUpdateFields = (body) => {
    return extractValidFields(body, courseInsertSchema)
}

exports.validateCourseCreationRequest = (body) => {
    return validateAgainstSchema(body, courseInsertSchema)
}

exports.extractArrayCourseFields = (courses) => {
    return courses.map(course => extractValidFields(course, courseInformationSchema))
}

exports.extractArrayStudentCourseFields = (courses) => {
    return courses.map(course => extractValidFields(course, courseStudentInformationSchema))
}