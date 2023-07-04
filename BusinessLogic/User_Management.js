require('dotenv').config();

const nodemailer = require('nodemailer');
const aPI_Urls = require('../Common/API_Urls');
const HOST_EMAIL = process.env.HOST_EMAIL;
const HOST_PASSWORD = process.env.HOST_PASSWORD;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;

// Send verification mail.

const send_verification_email = async (user_email, user_uuid, name) => {

    // Create a transporter object
const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE, // Use 'hotmail' for Outlook.com accounts
    auth: {
      user: HOST_EMAIL, // Your Outlook email address
      pass: HOST_PASSWORD // Your Outlook email password
    }
  });

  const html = '<h1>Hello ' + name + '!</h1> <p> Please Click on below link for email verification.</p> <p><a href="#">' + aPI_Urls.API_Urls.VerifyEmailURL + user_uuid + '</a></p>';
  
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

module.exports = {
    send_verification_email
}