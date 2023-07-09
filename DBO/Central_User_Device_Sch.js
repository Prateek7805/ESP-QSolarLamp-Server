const mongoose = require('mongoose');

const sch_user = mongoose.Schema({
    first_name : String,
    last_name: String,
    email : {
        type: String,
        unique : true
    },
    password : String,
    verified: {
        type: Boolean,
        default: false
    },
    verification_uuid: String,
    date_of_birth : String,
    refresh_tokens : [{
        token : {
            type: String,
        },
        valid: {
            type: Boolean,
            default: true
        }
    }],
    devices: [{
        name : String,
        password : String,
        status: {
            power : {
                type: Boolean,
                default: true
            },
            brightness : {
                type: Number,
                default: 30
            },
            data : [String]
        },
        creation_date: {
            type: Date,
            default: Date.now
        }
    }],
    creation_date: {
        type: Date,
        default: Date.now
    }
});

const dm_user = mongoose.model('users', sch_user);

module.exports = dm_user;