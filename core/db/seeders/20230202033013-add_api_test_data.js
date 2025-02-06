"use strict";

const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 8;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		/*
      CREATE USERS
    */

		let teacherOnlyUser = await queryInterface.bulkInsert(
			"Users",
			[
				{
					firstName: "Teacher",
					lastName: "User",
					email: "teacheruser@myclassroom.com",
					password: await bcrypt.hash("teacherteacher", saltRounds),
					isTeacher: true,
					admin: false,
				},
			],
			{}
		);

		let studentOnlyUser = await queryInterface.bulkInsert(
			"Users",
			[
				{
					firstName: "Student",
					lastName: "User",
					email: "studentuser@myclassroom.com",
					password: await bcrypt.hash("studentstudent", saltRounds),
					isTeacher: false,
					admin: false,
				},
			],
			{}
		);

		let studentUserNoCourses = await queryInterface.bulkInsert(
			"Users",
			[
				{
					firstName: "No",
					lastName: "Courses",
					email: "nocourses@myclassroom.com",
					password: await bcrypt.hash("nocourses", saltRounds),
					isTeacher: false,
					admin: false,
				},
			],
			{}
		);

		//let comboUser = await queryInterface.bulkInsert('Users', [{
		//  firstName: 'Combo',
		//  lastName: 'User',
		//  email: 'combouser@myclassroom.com',
		//  password: await bcrypt.hash('combocombocombo', saltRounds),
		//  admin: false
		//}], {});

		/*
      CREATE COURSE 1 DATA: for comprehensive testing
    */

		let course1 = await queryInterface.bulkInsert(
			"Courses",
			[
				{
					name: "Main Course",
					description: "This course is for primary testing",
					published: true,
				},
			],
			{}
		);

		let teachercourse1 = await queryInterface.bulkInsert(
			"Enrollments",
			[
				{
					userId: teacherOnlyUser,
					courseId: course1,
					role: "teacher",
				},
			],
			{}
		);

		let section1course1 = await queryInterface.bulkInsert(
			"Sections",
			[
				{
					courseId: course1,
					number: 0,
					joinCode: "123456",
				},
			],
			{}
		);

		let section2course1 = await queryInterface.bulkInsert(
			"Sections",
			[
				{
					courseId: course1,
					number: 1,
					joinCode: "654321",
				},
			],
			{}
		);

		let studentenrollmentsection1course1 = await queryInterface.bulkInsert(
			"Enrollments",
			[
				{
					userId: studentOnlyUser,
					sectionId: section1course1,
					role: "student",
				},
			],
			{}
		);

		let lecture1course1 = await queryInterface.bulkInsert("Lectures", [
			{
				courseId: course1,
				title: "Welcome",
				description: "A lecture to welcome you to the course",
				order: 0,
			},
		]);

		let lecture2course1 = await queryInterface.bulkInsert("Lectures", [
			{
				courseId: course1,
				title: "Introducing Main Course concepts",
				description: "A genera introduction to the course concepts",
				order: 1,
			},
		]);

		let question1course1 = await queryInterface.bulkInsert("Questions", [
			{
				type: "multiple choice",
				stem: "What is 1 + 2?",
				content: `{
          "options": {
              "0": 2,
              "1": 3,
              "2": 4,
              "3": 5
          }
      }`,
				answers: `{
          "0": false,
          "1": true,
          "2": false,
          "3": false
      }`,
				weights: `{
		"0": 1,
		"1": 1,
		"2": 1,
		"3": 1
	}`,
				courseId: course1,
			},
		]);

		let question2course1 = await queryInterface.bulkInsert("Questions", [
			{
				type: "multiple answer",
				stem: "Select all factors of 6? This is going to be a really long question stem to test how front end can respond to ugy long text of the stem",
				content: `{
          "options": {
              "0": 2,
              "1": 3,
              "2": 4,
              "3": 5
          }
      }`,
				answers: `{
          "0": true,
          "1": true,
          "2": false,
          "3": false
      }`,
				weights: `{
          "0": 1,
          "1": 1,
          "2": 1,
          "3": 1
      }`,
				courseId: course1,
			},
		]);

		let question1inlecture1 = await queryInterface.bulkInsert(
			"QuestionInLectures",
			[
				{
					questionId: question1course1,
					lectureId: lecture1course1,
					order: 1,
					published: true,
				},
			]
		);

		let question2inlecture1 = await queryInterface.bulkInsert(
			"QuestionInLectures",
			[
				{
					questionId: question2course1,
					lectureId: lecture1course1,
					order: 2,
					published: true,
				},
			]
		);

		let section1forlecture1 = await queryInterface.bulkInsert(
			"LectureForSections",
			[
				{
					sectionId: section1course1,
					lectureId: lecture1course1,
					published: true,
				},
			]
		);

		// create 100 duplicate questions to
		for (let i = 0; i < 100; i++) {
			await queryInterface.bulkInsert("Questions", [
				{
					type: "multiple choice",
					stem: `What is 17 + ${i}?`,
					content: `{
            "options": {
                "0": ${17 + i},
                "1": ${17 + i - 1},
                "2": ${17 - i},
                "3": ${17 + i + 1}
            }
        }`,
					answers: `{
            "0": true,
            "1": false,
            "2": false,
            "3": false
        }`,
					weights: `{
			"0": 1,
			"1": 1,
			"2": 1,
			"3": 1
		}`,
					courseId: course1,
				},
			]);
		}

		/*
      CREATE COURSE 2 DATA: only for testing multiple courses for a teacher and multiple courses for a student
    */

		let course2 = await queryInterface.bulkInsert(
			"Courses",
			[
				{
					name: "Multiple Course Testing",
					description:
						"This course is for testing multiple enrollments for one user",
				},
			],
			{}
		);

		let teachercourse2 = await queryInterface.bulkInsert(
			"Enrollments",
			[
				{
					userId: teacherOnlyUser,
					courseId: course2,
					role: "teacher",
				},
			],
			{}
		);

		let section1course2 = await queryInterface.bulkInsert(
			"Sections",
			[
				{
					courseId: course2,
					number: 0,
					joinCode: "567890",
				},
			],
			{}
		);

		let studentenrollmentsection1course2 = await queryInterface.bulkInsert(
			"Enrollments",
			[
				{
					userId: studentOnlyUser,
					sectionId: section1course2,
					role: "student",
				},
			],
			{}
		);

		/*
      CREATE COURSE 3 DATA: only for testing enrollment as teacher and student
    */

		let course3 = await queryInterface.bulkInsert(
			"Courses",
			[
				{
					name: "Test Combo User",
					description: "Test that a user can be a teacher and student",
				},
			],
			{}
		);

		//let teachercourse3 = await queryInterface.bulkInsert('Enrollments', [{
		//  userId: comboUser,
		//  courseId: course3,
		//  role: 'teacher'
		//}], {})
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete(
			"Users",
			{
				email: "teacheruser@myclassroom.com",
			},
			{}
		);
		await queryInterface.bulkDelete(
			"Users",
			{
				email: "studentuser@myclassroom.com",
			},
			{}
		);
		await queryInterface.bulkDelete(
			"Users",
			{
				email: "combouser@myclassroom.com",
			},
			{}
		);
		await queryInterface.bulkDelete(
			"Users",
			{
				email: "nocourses@myclassroom.com",
			},
			{}
		);
		await queryInterface.bulkDelete(
			"Courses",
			{
				name: "Test Combo User",
			},
			{}
		);
		await queryInterface.bulkDelete(
			"Courses",
			{
				name: "Main Course",
			},
			{}
		);
		await queryInterface.bulkDelete(
			"Courses",
			{
				name: "Multiple Course Testing",
			},
			{}
		);
	},
};
