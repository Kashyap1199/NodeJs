const express = require('express');
const routes = express.Router();
const { setErrorInTextFile } = require('../errortext');
const emailVerification = require('../models/email-verification-model');
const employee = require('../models/employee-model');

/**
 * @swagger
 * /api/email-verification:
 *   get:
 *    tags:
 *      - Employee email verification
 *    summary: Verify email using token
 *    description: This endpoint verifies the email of a user using a token sent to their email address. The token is passed as a query parameter in the request URL. If the token is valid and not expired, the user's email is marked as verified.
 *    parameters:
 *     - in: query
 *       name: token
 *       schema:
 *       type: string
 *       required: true
 *    responses:
 *        200:
 *          description: Email verified successfully.
 *        400:
 *          description: Invalid or expired token.
 *        500:
 *          description: Internal server error.
 *        401:
 *          description: Unauthorized access.
 */
routes.get('', async (req, res) => {

  try {
    const token = req.query.token;

    const verification =
        await emailVerification.findOne({ token });

    if (!verification)
        return res.status(400).json({
            message: "Invalid token"
        });

    if(verification.isEmailVerified)
        return res.status(400).json({
            message: "Email already verified"
        });

    if (verification.expireAt < new Date())
        return res.status(400).json({
            message: "Token expired"
        });

    await emailVerification.findByIdAndUpdate(
        verification._id,
        {
            isEmailVerified: true,
            isEmailVerificationInviteExpired: true
        });

    await employee.findByIdAndUpdate(
        verification.userId,
        {
           isActive: true
        });

    res.status(200).json({
        message: "Email verified successfully."
    });
  } catch (err) {
    console.log(err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
  }
});

module.exports = routes;
