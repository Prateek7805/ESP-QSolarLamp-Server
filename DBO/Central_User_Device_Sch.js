const mongoose = require('mongoose');

const sch_user = mongoose.Schema({
    name : String,
    email : {
        type: String,
        unique : true
    },
    password : String,
    date_of_birth : String,
    refresh_tokens : [{
        token : {
            type: String,
            unique : true
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
            brightness : Number,
            data : [String]
        }
    }]
});

const dm_user = mongoose.model('users', sch_user);

module.exports = dm_user;