"use strict";

const question_types = ["multiple choice", "multiple answer"];

module.exports = (sequelize, DataTypes) => {
	const Question = sequelize.define(
		"Question",
		{
			// the id column should be standardized across all models
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			courseId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Courses",
					key: "id",
				},
				validate: {
					notNull: {
						msg: "Question must have a course",
					},
				},
			},
			type: {
				// multiple choice only for now
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					isIn: {
						args: [question_types],
						msg: "Question type is not a valid option",
					},
				},
			},
			stem: {
				// the stem is just the wording of the question being posed
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					notNull: {
						msg: "Question stem text must be provided",
					},
					notEmpty: {
						msg: "Question stem text must be provided",
					},
				},
			},
			// define weights which should have a default value of 1 and should have as many elements as number of questions
			weights: {
				type: DataTypes.JSON,
				validate: {
					perTypeValidation(value) {
						switch (this.type) {
							case "multiple choice":
							case "multiple answer":
								if (value == null) {
									throw new Error(`${this.type} question must have weights`);
								}
								let weights_length = Object.keys(value).length;
								if (
									weights_length != Object.entries(this.content.options).length
								) {
									// the weights object must have the same number of elements as the content
									throw new Error(
										`${this.type} question must have a weight for each option`
									);
								}
								let index = 0; // the weights must be indexed increasing from 0
								for (; index < weights_length; index++) {
									let weight = value[index];
									// the weights must have a numeric value
									if (weight == null) {
										throw new Error(
											`${this.type} question weight indexed incorrectly or null`
										);
									} else if (typeof weight != "number") {
										throw new Error(
											`${this.type} question weight must have a numeric value`
										);
									}
								}
								break;
							default:
								break;
						}
					},
				},
			},
			content: {
				// the JSON that is unique to each question type
				type: DataTypes.JSON,
				validate: {
					perTypeValidation(value) {
						switch (this.type) {
							case "multiple choice":
							case "multiple answer":
								let options = value.options;
								if (options == null) {
									// the options object must exist
									throw new Error(`${this.type} question must have options`);
								}
								let options_length = Object.keys(options).length;
								if (options_length < 2) {
									// there must be more than 2 options
									throw new Error(
										`${this.type} question must have more than 1 option`
									);
								}
								let index = 0; // the options must be indexed increasing from 0
								for (; index < options_length; index++) {
									let option = options[index];
									// the options must have more value than an empty or whitespace string
									if (option == null) {
										throw new Error(
											`${this.type} question option indexed incorrectly or null`
										);
									} else if (
										typeof option == "string" &&
										option.trim() === ""
									) {
										throw new Error(
											`${this.type} question option must have a string or numeric value`
										);
									}
								}
								break;
							default:
								break;
						}
					},
				},
			},
			answers: {
				type: DataTypes.JSON,
				validate: {
					perTypeValidation(value) {
						switch (this.type) {
							case "multiple choice":
							case "multiple answer":
								const answers_length = Object.entries(value).length;
								if (
									answers_length != Object.entries(this.content.options).length
								) {
									//the answers object must have the same number of elements as the content
									throw new Error(
										`${this.type} question must have indication of correctness for each option`
									);
								}
								let true_answers = 0;
								let index = 0; // the answers must be indexed increasing from 0
								for (; index < answers_length; index++) {
									let answer = value[index];
									// the answer must be a true or false value
									if (answer == null) {
										throw new Error(
											`${this.type} question answer indexed incorrectly or null`
										);
									} else if (!(answer === true || answer === false)) {
										throw new Error(
											`${this.type} question answer must have a boolean value`
										);
									}
									if (answer === true) {
										true_answers += 1;
									}
								}
								if (true_answers != 1 && this.type == "multiple choice") {
									// only one answer can be correct for multiple choice
									throw new Error(
										`${this.type} question can only and must have 1 correct answer`
									);
								} else if (true_answers < 1 && this.type == "multiple answer") {
									throw new Error(
										`${this.type} question must have at least 1 correct answer`
									);
								}
								break;
							default:
								break;
						}
					},
				},
			},
		},
		{
			timestamps: true,
		}
	);

	Question.associate = (models) => {
		Question.belongsTo(models.Course);
		Question.hasMany(models.QuestionInLecture);
	};

	return Question;
};

/* Question Type Documentation:

    Multiple Choice / Multiple Answer:

        content: {
            options: {
                1: "",
                2: "",
                3: "",
                4: "",
                ...
            }
        }

        // multiple answer can have > 1 answers true
        answers: {
            1: false,
            2: true,
            3: false,
            4: false,
            ....
        }


*/
