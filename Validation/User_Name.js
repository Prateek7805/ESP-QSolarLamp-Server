const pv = require('password-validator');

const sch_user_name = new pv();

sch_user_name.is().min(2)
.is().max(20)
.has().not().spaces()
.has().not().digits()
.has().not().symbols()

const validate = (name) => {
    const name_check = sch_user_name.validate(name, {list: true});
    const initial_check = ['min', 'max'];
    if(name_check.length === 0){
        return {code : 200, message: "ok"};
    }
    if(initial_check.some(item=>name_check.includes(item))){
        return {code : 400, message: "Please enter the firstname and lastname between 2 and 20 characters"};
    }
    return {code: 400, message: "Please enter the firstname or lastname without any spaces, numbers or symbols"};
}
module.exports = {
    sch_user_name,
    validate
}