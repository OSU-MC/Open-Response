const {
	extractValidFields,
	validateAgainstSchema,
} = require("../../lib/validator");

const responseInformationSchema = {
	id: { required: true },
	enrollmentId: { required: true },
	questionInLectureId: { required: true },
	score: { required: true },
	points: { required: false },
	totalPoints: { required: false },
	submission: { required: true },
};

const responseInsertSchema = {
	enrollmentId: { required: true },
	questionInLectureId: { required: true },
	score: { required: true },
	points: { required: false },
	totalPoints: { required: false },
	submission: { required: true },
};

exports.extractResponseInsertFields = (body) => {
	return extractValidFields(body, responseInsertSchema);
};

exports.extractResponseFields = (body) => {
	return extractValidFields(body, responseInformationSchema);
};
