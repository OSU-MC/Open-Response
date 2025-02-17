'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert('Users', [{
       firstName: 'Admin',
       lastName: 'Admin',
       email: 'admin@myclassroom.com',
       password: 'adminpassword123',
       isTeacher: true,
       admin: true
     }], {});
  },

  async down (queryInterface, Sequelize) {
      // second argument passed is the where clause. So we only delete this seed-generated admin user, in case others exist
      await queryInterface.bulkDelete('Users', { email: 'admin@myclassroom.com' }, {});
  }
};
