"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("Grades", "userId", {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: "Users",
				key: "id",
			},
			onDelete: "CASCADE",
		});
		await queryInterface.addColumn("Grades", "enrollmentId", {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: "Enrollments",
				key: "id",
			},
			onDelete: "CASCADE",
		});
		await queryInterface.addColumn("Grades", "sectionId", {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: "Sections",
				key: "id",
			},
			onDelete: "CASCADE",
		});
	},
};
