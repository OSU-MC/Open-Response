"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("Grades", {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			grade: {
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
		return queryInterface.dropTable("Grades");
	},
};
