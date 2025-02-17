require('dotenv').config({ override: false})
const db = require('../app/models')

module.exports = async () => {
   await db.sequelize.authenticate()
}

module.exports.db = db