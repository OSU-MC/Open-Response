"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Questions", {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			type: {
				// multiple choice only for now
				type: Sequelize.STRING,
				allowNull: false,
			},
			stem: {
				// the stem is just the wording of the question being posed
				type: Sequelize.STRING,
				allowNull: false,
			},
			weights: {
				type: Sequelize.JSON,
			},
			content: {
				// the JSON that is unique to each question type
				type: Sequelize.JSON,
			},
			answers: {
				type: Sequelize.JSON,
			},
			// these columns should be standardized across all future tables created
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.dropTable("Questions");
	},
};
