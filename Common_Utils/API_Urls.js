require('dotenv').config();


const API_Urls = {
    VerifyEmailURL: `${process.env.APPLICATION_END_POINT}/verify?id=`
}

module.exports = API_Urls 