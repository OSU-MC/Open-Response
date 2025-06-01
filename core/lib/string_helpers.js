module.exports = {
    // this method simply iterates over the sequelize validation error object and returns the error message of each error as an array of strings
    // it can be more nuanced and detailed moving forward, but for now it will suffice
    serializeSequelizeErrors: (e) => {
        return e.errors.map((error) => {
            return error.message
        })
    },
    serializeStringArray: (strings) => {
        return strings.join(', ')
    }
}