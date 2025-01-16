const { extractValidFields, validateAgainstSchema } = require('../../lib/validator')

const sectionInformationSchema = {
    id: {required: true},
    courseId: {required: true},
    number: {required: true},
    joinCode: {required: true}
}
const sectionInsertSchema = {
    courseId: {required: true},
    number: {required: true},
    joinCode: {required: true}
}

exports.extractSectionFields = (body) => {
    return extractValidFields(body, sectionInformationSchema)
}

exports.validateSectionCreationRequest = (body) => {
    return validateAgainstSchema(body, sectionInsertSchema)
}