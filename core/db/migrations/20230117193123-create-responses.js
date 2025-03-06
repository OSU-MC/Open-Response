"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Responses", {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			score: {
				type: Sequelize.DOUBLE,
				allowNull: false,
			},
			points: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			totalPoints: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			submission: {
				type: Sequelize.JSON,
				defaultValue: {},
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
		return queryInterface.dropTable("Responses");
	},
};
