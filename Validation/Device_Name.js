const pv = require('password-validator');

const sch_device_name = new pv();

sch_device_name.is().min(8)
.is().max(20)
.has().not().spaces();

const validate = (name) => {
    const name_check = sch_device_name.validate(name, {list: true});
    const initial_check = ['min', 'max'];
    if(name_check.length === 0){
        return {code : 200, message: "ok"};
    }
    if(initial_check.some(item=>name_check.includes(item))){
        return {code : 200, message: "Please enter a device name between 8 and 20 characters"};
    }
    return {code: 200, message: "Please enter a device name without spaces"};
}
module.exports =  {
    sch_device_name,
    validate
}