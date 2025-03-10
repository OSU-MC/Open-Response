const {
	extractValidFields,
	validateAgainstSchema,
} = require("../../lib/validator");

const responseInformationSchema = {
	id: { required: false },
	userId: { required: true },
	enrollmentId: { required: true },
	sectionId: { required: true },
	score: { required: true },
	points: { required: true },
	totalPoints: { required: true },
};

const responseInsertSchema = {
	id: { required: false },
	userId: { required: true },
	enrollmentId: { required: true },
	sectionId: { required: true },
	grade: { required: true },
	points: { required: true },
	totalPoints: { required: true },
};

exports.extractResponseInsertFields = (body) => {
	return extractValidFields(body, responseInsertSchema);
};

exports.extractResponseFields = (body) => {
	return extractValidFields(body, responseInformationSchema);
};
