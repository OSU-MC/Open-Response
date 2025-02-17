require('dotenv').config({ override: false})
const db = require('../app/models')
const { logger } = require('../lib/logger')

module.exports = async () => {
    try {
        // User and Course are the only models that exist independently. Everything else will delete on the cascade
        await db.User.destroy({
            where: {}
        })
        await db.Course.destroy({
            where: {}
        })
    }
    catch (e) {
        logger.error(e)
    }
    
    await db.sequelize.close()
    process.exit()
};