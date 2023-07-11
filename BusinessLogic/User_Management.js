require('dotenv').config();

const nodemailer = require('nodemailer');
const aPI_Urls = require('../Common_Utils/API_Urls');
const HOST_EMAIL = process.env.HOST_EMAIL;
const HOST_PASSWORD = process.env.HOST_PASSWORD;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const dm_user = require('../DBO/Central_User_Device_Sch');

// Send verification mail.

const send_verification_email = async (user_email, user_uuid, user_fname) => {

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE, // Use 'hotmail' for Outlook.com accounts
    auth: {
      user: HOST_EMAIL, // Your Outlook email address
      pass: HOST_PASSWORD // Your Outlook email password
    }
  });

  const html = `<h1>Hello ${user_fname}!</h1> <p> Please Click on link below for email verification.</p> <p><a href="${aPI_Urls.VerifyEmailURL}${user_uuid}"> Verify User </a></p>`;

  // Define the email options
  const mailOptions = {
    from: HOST_EMAIL, // Sender address
    to: user_email, // Recipient address
    subject: 'User Registration Confirmation.', // Email subject
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
  const user = await dm_user.findOne({ verification_uuid: uuid });
  if (!user) {
    return false;
  }
  user.verified = true;
  await user.save();
  return true;
}

module.exports = {
  send_verification_email,
  verify_user
}