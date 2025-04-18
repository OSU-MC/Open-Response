const {
	extractValidFields,
	validateAgainstSchema,
} = require("../../lib/validator");
const db = require("../models/index");

const enrollmentInformationSchema = {
	id: { required: true },
	role: { required: true },
	courseId: { required: false },
	userId: { required: true },
	grade: { required: false },
	sectionId: { required: false },
	User: { required: true },
};

const enrollmentInsertSchema = {
	role: { required: true },
	courseId: { required: false },
	userId: { required: true },
	sectionId: { required: false },
};

exports.extractEnrollmentFields = (body) => {
	return extractValidFields(body, enrollmentInformationSchema);
};

exports.validateEnrollmentCreationRequest = (body) => {
	return validateAgainstSchema(body, enrollmentInsertSchema);
};

exports.checkIfTeacher = async (userId, courseId) => {
	return await db.Enrollment.findOne({
		where: {
			userId: userId,
			courseId: courseId,
			role: "teacher",
		},
	});
};

exports.extractArrayEnrollmentFields = (enrollments) => {
	return enrollments.map((enrollment) =>
		extractValidFields(enrollment, enrollmentInformationSchema)
	);
};
