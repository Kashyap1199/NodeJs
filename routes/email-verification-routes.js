const express = require('express');
const routes = express.Router();
const { setErrorInTextFile } = require('../errortext');
const emailVerificationModel = require('../models/email-verification-model');

routes.get('email-verification', async (req, res) => {

  try {
    const token = req.query.token;

    const verification =
        await emailVerificationModel.findOne({ token });

    if (!verification)
        return res.status(400).json({
            message: "Invalid token"
        });

    if (verification.expiresAt < new Date())
        return res.status(400).json({
            message: "Token expired"
        });

    await User.findByIdAndUpdate(
        verification.userId,
        {
            isEmailVerified: true,
            isEmailVerificationInviteExpired: true
        });

    res.json({
        message: "Email verified successfully."
    });
  } catch (err) {
    console.log(err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
  }
});

module.exports = routes;
