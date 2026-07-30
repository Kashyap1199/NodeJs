const nodeEmailer = require('nodemailer');
const { setErrorInTextFile } = require('../errortext')
const  generateEmailVerificationToken = require('./../email-verification-token');
const  emailVerificationModel = require('./../models/email-verification-model');

const transpoter = nodeEmailer.createTransport({
  service: "gmail",
  auth: {
    user: "kptravelling11@gmail.com",
    pass: "xyky ozna ozcf uwsi",
  }
});

const sendVerificationEmail = async (email, userName, token) => {
  try {
    const url = `http://localhost:3000/api/email-verification?token=${token}`;

    transpoter.sendMail({
      from: "kptravelling11@gmail.com",
      to: email,
      subject: "Email verification",
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2c3e50;">Verify Your Email Address</h2> <p>Hello <strong>${userName}</strong>,</p>
        <p> Thank you for registering with us. To complete your account setup, please verify your email address by clicking the button below. </p>
        <p style="margin: 30px 0;"> <a href="${url}" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;"> Verify Email </a> </p>
        <p> This verification link will expire in <strong>1 hour</strong>. </p>
        <p> If you did not create this account, you can safely ignore this email. </p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
        <p style="font-size: 12px; color: #777;"> This is an automated email. Please do not reply. </p>
      </div>`
    })

  } catch (err) {
    console.error('Error in sendVerificationEmail:', err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
  }
};

const addEmailVerification = async (user) => {
  try {
    const token = generateEmailVerificationToken();
    const emailVerification = new emailVerificationModel();
    emailVerification.userId = user.id;
    emailVerification.token = token;
    emailVerification.expireAt = new Date(Date.now() + 1000 * 60 * 60)
    await emailVerification.save();

    await sendVerificationEmail(user.emailId, user.userName, token); // send email verfication

  } catch(err) {
    console.error('Error in addEmailVerification:', err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
  }
}

module.exports = {
  transpoter, sendVerificationEmail, addEmailVerification
}
