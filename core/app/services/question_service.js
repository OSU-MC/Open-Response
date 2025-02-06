const questionInsertSchema = {
	courseId: { required: true },
	type: { required: true },
	stem: { required: true },
	content: { required: true },
	answers: { required: true },
};

exports.extractQuestionUpdateFields = (body) => {
	return extractValidFields(body, questionInsertSchema);
};

exports.validateQuestionCreationRequest = (body) => {
	return validateAgainstSchema(body, questionInsertSchema);
};

exports.extractArrayQuestionFields = (questions) => {
	return questions.map((question) =>
		extractValidFields(question, questionInformationSchema)
	);
};

/*
    submission: {
        answers: {
            1: false,
            2: true,
            3: false,
            4: false,
        }
    }
*/

const {
	extractValidFields,
	validateAgainstSchema,
} = require("../../lib/validator");
const db = require("../models/index");

const questionInformationSchema = {
	id: { required: true },
	courseId: { required: true },
	type: { required: true },
	stem: { required: true },
	weights: { required: false },
	content: { required: false },
	answers: { required: false },
};

// doesn't have question ID... this is usually called along with the schema above, avoid duplicates
const questionInLectureInformationSchema = {
	lectureId: { required: true },
	order: { required: false },
	published: { required: true },
};

// includes question ID (used when inserting a question-lecture relationship)
const completeQuestionInLectureInformationSchema = {
	questionId: { required: true },
	lectureId: { required: true },
	order: { required: false },
	published: { required: false },
};

exports.validateQuestionInLectureCreationRequest = (body) => {
	return validateAgainstSchema(
		body,
		completeQuestionInLectureInformationSchema
	);
};

exports.extractQuestionFields = (body) => {
	return extractValidFields(body, questionInformationSchema);
};

exports.extractQuestionInLectureFields = (body) => {
	return extractValidFields(body, questionInLectureInformationSchema);
};

exports.extractCompleteQuestionInLectureFields = (body) => {
	return extractValidFields(body, completeQuestionInLectureInformationSchema);
};

const getQuestionScore = function (question, submission) {
	let grade = 0;
	switch (question.type) {
		case "multiple choice":
		case "multiple answer":
			grade = scoreMultipleQuestion(question, submission);
	}
	return Math.round((grade + Number.EPSILON) * 100) / 100;
};

const scoreMultipleQuestion = function (question, submission) {
	const answers = submission.answers;
	if (answers == null) {
		// no answers in the submission? The score must be 0
		return 0;
	}
	const matchResults = getMatchResults(question, answers);
	const positiveFraction = 1.0 / matchResults.numTrueAnswers;
	let score =
		positiveFraction * matchResults.truePositives -
		positiveFraction * matchResults.falsePositives;
	if (score < 0) score = 0;
	return score;
};

const getMatchResults = function (question, answers) {
	let falsePositives = 0;
	let falseNegatives = 0;
	let truePositives = 0;
	let trueNegatives = 0;
	let index = 0;
	let numTrueAnswers = 0;
	for (; index < Object.entries(question.answers).length; index++) {
		if (answers[index] === true && question.answers[index] === true) {
			truePositives += 1;
			numTrueAnswers += 1;
		} else if (answers[index] === true && question.answers[index] === false) {
			falsePositives += 1;
		} else if (answers[index] === false && question.answers[index] === true) {
			falseNegatives += 1;
			numTrueAnswers += 1;
		} else {
			trueNegatives += 1;
		}
	}
	return {
		falsePositives: falsePositives,
		falseNegatives: falseNegatives,
		truePositives: truePositives,
		trueNegatives: trueNegatives,
		numTrueAnswers: numTrueAnswers,
	};
};

exports.getQuestionScore = getQuestionScore;

// just as if 'getQuestion', but checks against given course as well
exports.getQuestionInCourse = async (questionId, courseId) => {
	return await db.Question.findOne({
		where: {
			id: questionId,
			courseId: courseId,
		},
	});
};

exports.getQuestionInLecture = async (questionId, lectureId) => {
	return await db.QuestionInLecture.findOne({
		where: {
			questionId: questionId,
			lectureId: lectureId,
		},
	});
};
