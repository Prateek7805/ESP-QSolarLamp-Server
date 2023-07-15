
const validate = (date_of_birth) => {
    try{
        const MAX_AGE = 150;
        if(!date_of_birth){
            return {code : 200, message: 'No dob found'}
        }
        const dob = new Date(date_of_birth);
        if(isNaN(dob)){
            return {code: 400, message: 'Please Enter a valid date'};
        }
        const sysdate = new Date();
        const pastDate = new Date(sysdate);
        const currYear = sysdate.getFullYear();
        pastDate.setFullYear(currYear - MAX_AGE);
        if(dob > sysdate){
            return {code: 400, message : 'Please Enter a past date'};
        }
        if(dob < pastDate){
            return {code: 400, message : `Are you really ${currYear - dob.getFullYear()} years old?`};
        }
        if(dob >= pastDate && dob <= sysdate){
            return {code: 200, message : date_of_birth};
        }
    }catch(err){
        return {code : 500, message: 'Date of Birth validation failed'};
    }
}

module.exports = {validate}