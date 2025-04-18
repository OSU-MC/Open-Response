'use strict' 

const moment = require('moment');
const { generateOTP } = require('../../lib/password_gen')

module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
           type: DataTypes.INTEGER,
           allowNull: false,
           references: {
               model: 'Users',
               key: 'id'
           },
           onDelete: 'CASCADE'
        },
        expires: {
            type: DataTypes.DATE(6),
        },
        csrfToken: {
            type: DataTypes.STRING,
            unique: true
        }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: (session) => {
                session.expires = moment().add(4, 'H').utc()
                session.csrfToken = generateOTP(16)
            }
        }
    })

    Session.associate = (models) => {
        Session.belongsTo(models.User)
    }

    //Sends true if the current session is expired, false if not
    Session.prototype.checkIfExpired = function (){
        return !moment().utc().isBefore(moment(this.expires))
    }

    return Session
}

