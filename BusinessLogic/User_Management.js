require('dotenv').config();

const nodemailer = require('nodemailer');
const API_Urls = require('../Common_Utils/API_Urls');
const HOST_EMAIL = process.env.HOST_EMAIL;
const HOST_PASSWORD = process.env.HOST_PASSWORD;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const dm_user = require('../DBO/Central_User_Device_Sch');

// Send verification mail.

const send_verification_email = async (origin_id, user_email, user_uuid, user_fname) => {

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE, // Use 'hotmail' for Outlook.com accounts
    auth: {
      user: HOST_EMAIL, // Your Outlook email address
      pass: HOST_PASSWORD // Your Outlook email password
    }
  });

  const html = `<style>
                  .verify-btn-container{
                      display: flex;
                      width: 100%;
                      justify-content: center;
                      margin-top: 10px;
                  }
                  .verify-btn{
                      border: none;
                      border-bottom: 5px solid #F1C93B;
                      padding: 15px; 
                      background-color: #164B60;
                      color: #FFFFFF;
                      border-radius: 10px;
                  }
                  .verify-btn:active{
                    border-bottom: none;
                    transform:scale(0.96);
                  }
                  </style>
                  <h1 style="text-align: center">Greetings ${user_fname}!</h1> 
                  <p style="text-align: center;"> Please Click on the below button to verify your Email</p> 
                  <div class="verify-btn-container"><a href="${API_Urls.VerifyEmailURL}/verify?id=${user_uuid}&origin_id=${origin_id}" target="_blank"><button class="verify-btn"> Verify User </button></a></div>
`;
  // Define the email options
  const mailOptions = {
    from: HOST_EMAIL, // Sender address
    to: user_email, // Recipient address
    subject: 'Qsolarlamp Registration Confirmation', // Email subject
    html: html // Email body
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

const verify_user = async (uuid) => {
  //Need to add try catch and code, message style
  try {
    const user = await dm_user.findOne({ verification_uuid: uuid });
    if (!user) {
      return { code: 404, message: "User not found" };
    }
    if (user.verified) {
      return { code: 409, message: "User already verified" };
    }
    user.verified = true;
    await user.save();
    return { code: 200, message: "User verified" };
  } catch (err) {
    return { code: 500, message: err };
  }
}

module.exports = {
  send_verification_email,
  verify_user
}