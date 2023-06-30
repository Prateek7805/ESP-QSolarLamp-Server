const mongoose = require('mongoose');
const sch_license_key = mongoose.Schema({
    uid : {
        type: String,
        required: true,
        unique : true
    },
    device_id : String,
    type : {
        type: String,
        required: true
    },
    valid : {
        type: Boolean,
        required: true,
        default: true
    }
});

const dm_license_key = mongoose.model('license_keys', sch_license_key);

module.exports = dm_license_key;