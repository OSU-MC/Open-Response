const { Router } = require('express')
const router = Router()

router.use('/courses', require('./courses'))
router.use('/users', require('./users'))

module.exports = router