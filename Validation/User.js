const pv = require('password-validator');

const user_name = (data) => {
    const sch_user_name = new pv();

    sch_user_name.is().min(2)
        .is().max(20)
        .has().not().spaces()
        .has().not().digits()
        .has().not().symbols()

    const name_check = sch_user_name.validate(data, { list: true });
    const initial_check = ['min', 'max'];
    if (name_check.length === 0) {
        return { code: 200, message: "ok" };
    }
    if (initial_check.some(item => name_check.includes(item))) {
        return { code: 400, message: "Please enter the firstname and lastname between 2 and 20 characters" };
    }
    return { code: 400, message: "Please enter the firstname or lastname without any spaces, numbers or symbols" };

}
const email = (data) => {
    const sch_email = new pv();
    sch_email.is().min(4)
        .is().max(150)
        .is().usingPlugin((value) => {
            const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return email_regex.test(value);
        });
    const email_valid = sch_email.validate(data);
    if (!email_valid) {
        return { code: 400, message: 'Invalid Email ID' }
    }
    return { code: 200, message: '' }
}

const password = (data) => {
    const sch_password = new pv();
    sch_password.is().min(8)
        .is().max(20)
        .has().uppercase()
        .has().lowercase()
        .has().digits()
        .has().symbols();

    const pel = sch_password.validate(data, { list: true }).map(item => {
        if (item.endsWith('s')) {
            return item.substring(0, item.length - 1);
        }
        return item;
    });
    const initial_check = ['min', 'max'];
    if (pel.length === 0) return { code: 200, message: 'password validated' };
    if (initial_check.some(item => pel.includes(item)))
        return { code: 400, message: 'Please enter a password between 8 and 20 characters' };
    return { code: 400, message: `Please enter a password with atleast 1 ${pel.join(', ')} characters` };
}

const dob = (date_of_birth) => {
    try {
        const MAX_AGE = 150;
        if (!date_of_birth) {
            return { code: 200, message: 'No dob found' }
        }
        const dob = new Date(date_of_birth);
        if (isNaN(dob)) {
            return { code: 400, message: 'Please Enter a valid date' };
        }
        const sysdate = new Date();
        const pastDate = new Date(sysdate);
        const currYear = sysdate.getFullYear();
        pastDate.setFullYear(currYear - MAX_AGE);
        if (dob > sysdate) {
            return { code: 400, message: 'Please Enter a past date' };
        }
        if (dob < pastDate) {
            return { code: 400, message: `Are you really ${currYear - dob.getFullYear()} years old?` };
        }
        if (dob >= pastDate && dob <= sysdate) {
            return { code: 200, message: date_of_birth };
        }
    } catch (err) {
        return { code: 500, message: 'Date of Birth validation failed' };
    }
}

const origin = (data) => {
    if (!data) {
        return { code: 404, message: 'Origin ID not found' };
    }
    const allowed_origins = process.env.ALLOWED_CLIENT_END_POINTS;
    const allowed_origins_array = allowed_origins.split(',');
    const origin_index = allowed_origins_array.indexOf(data);
    if (origin_index === -1) {
        return { code: 400, message: 'Invalid Origin' };
    }
    return { code: 200, message: origin_index };
}

const origin_id = (data) => {
    try {
        if (!data) {
            return { code: 404, message: 'Origin ID not found' };
        }
        const index = parseInt(data);
        if (isNaN(index)) {
            return { code: 400, message: 'Origin ID is not a number' };
        }
        if (index < 0) {
            return { code: 400, message: 'Origin ID is not a negative number' };
        }
        const allowed_origins = process.env.ALLOWED_CLIENT_END_POINTS;
        const allowed_origins_array = allowed_origins.split(',');
        const origin_url = allowed_origins_array[index];
        if (origin_url === undefined) {
            return { code: 400, message: 'Origin not allowed' };
        }
        return { code: 200, message: origin_url };
    } catch (err) {
        return { code: 500, message: 'Origin ID failed processing' }
    }
}

module.exports = { user_name, email, password, dob, origin, origin_id };