require('dotenv').config();

const nodemailer = require('nodemailer');
const HOST_EMAIL = process.env.HOST_EMAIL;
const HOST_PASSWORD = process.env.HOST_PASSWORD;

// Send verification mail.

const send_verification_email = async (user_email, user_uuid) => {

    // Create a transporter object
const transporter = nodemailer.createTransport({
    service: 'hotmail', // Use 'hotmail' for Outlook.com accounts
    auth: {
      user: HOST_EMAIL, // Your Outlook email address
      pass: HOST_PASSWORD // Your Outlook email password
    }
  });

  const html = `
      <h1>Hello User</h1>
      <p>Please click on below link for email verification. </p>
      `

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