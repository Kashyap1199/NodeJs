const express = require('express');
const routes = express.Router();
const employee = require('../models/employee-model');
const { setErrorInTextFile } = require('../errortext');
const { generateToken } = require('../jwt');
const bcrypt = require('bcrypt');
const { addLoginAttempt,
  addUpdateLoginLockoutStatus,
  isUserLockedOut,
  getRemainingTimeForLockoutStatusByUserId,
  resetLoginLockoutStatusByUserId,
  isLoginLockoutsStatusIsExpired,
  getLoginLockoutStatusUserById
} = require('../login-attempt');
const { MAX_LOGIN_ATTEMPTS,
  LOGIN_LOCKOUT_DURATION_MINUTES,
  MIN_LOGIN_ATTEMPTS_WARNING
 } = require('.././constant/login-attempt.constants');
 const  { isUserActive } = require('./../employee');

/**
 * @swagger
 * /api/login/getToken:
 *  post:
 *          tags:
 *            - Login
 *          summary: Get the token with registered employee
 *          description: Will get the token of JWT
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              userName:
 *                                  type: string
 *                                  required: true
 *                              password:
 *                                  type: string
 *                                  required: true
 *          responses:
 *              200:
 *                  description: Successful response with token
 *              400:
 *                  description: Response with bad request
 *              404:
 *                  description: Response with employee not found
 *              500:
 *                  description: Response with internal server error
 *
 */

routes.post('/getToken', async (req, res) => {

    // taking credentials
    const { userName, password } = req.body;

    // checking employee is exists or not
    const user = await employee.findOne({ userName: userName });

    if (!(await isUserActive(user.id)))
      return res.status(500).json({ error: 'User is not active, please contact to administartor.' });

    if(await isLoginLockoutsStatusIsExpired(user.id))
      await resetLoginLockoutStatusByUserId(user.id)

    if (await isUserLockedOut(user.id)) {
      const time = await getRemainingTimeForLockoutStatusByUserId(user.id);
      return res.status(500).json({ error: `User is locked out, please try after ${time}` });
    }

    if (!user) {
        setErrorInTextFile({ errorName: "User not found", errorMessage: "User not found !", date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        await addLoginAttempt(userName, req.ip, req.get('User-Agent'), false, null, "UserNotFound");
        return res.status(404).json({ error: "User not found. Please register first." });
    } else if (!(await user.comparedPassword(password))) {
        setErrorInTextFile({ errorName: "Invalid credentials", errorMessage: "Username or password incorrect", date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        await addLoginAttempt(userName, req.ip, req.get('User-Agent'), false, user.id, "InvalidCredentials");
        await addUpdateLoginLockoutStatus(user.id, false); // Log lockout status for existing user
        const userLockStatus = await getLoginLockoutStatusUserById(user.id);
        if (userLockStatus.failedAttemptCount == MIN_LOGIN_ATTEMPTS_WARNING) {
          return res.status(401).json({ error: "Invalid username or password. You have used 2 of 5 allowed login attempts. Your account will be locked after 3 more failed attempt." });
        } else if(userLockStatus.failedAttemptCount == MAX_LOGIN_ATTEMPTS) {
          return res.status(401).json({ error: "Invalid username or password. You have reached allowed login attempts. Your account is locked try after 30 minutes." });
        }
        return res.status(401).json({ error: "Username or password incorrect" });
    }

    await addLoginAttempt(userName, req.ip, req.get('User-Agent'), true, user.id, null); // Log successful login attempt

    try {
        const payload = {
            userId: user.id,
            userName: user.userName
        }
        const token = await generateToken(payload);
        res.json({ token });
    } catch (err) {
        console.log(err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
});


/**
 * @swagger
 * /api/login/forgetPassword:
 *  post:
 *          tags:
 *              - Login
 *          summary: Registered user can update password
 *          description: Get new update user when it's successful
 *          requestBody:
 *              required: true
 *              content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                      userName:
 *                                              type: string
 *                                              required: true
 *                                      password:
 *                                              type: string
 *                                              required: true
 *          responses:
 *              200:
 *                  description: Sucessful response with updated password
 *              400:
 *                  description: Response with bad request
 *              401:
 *                  description: Response with unathorized
 *              500:
 *                  description: Response with Internal server error
 *
 *
 *
 *
 *
 */
routes.post('/forgetPassword', async function (req, res) {

    try {
        const { userName, password } = req?.body;

        const user = await employee.findOne({ userName: userName });

        if (!user) {
            setErrorInTextFile({ errorName: "User not found", errorMessage: "User: " + userName + " not found or invalid !" , date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
            await addLoginAttempt(userName, req.ip, req.get('User-Agent'), false, null, "UserNotFound");
            await addUpdateLoginLockoutStatus(null, false); // Log lockout status for non-existent user
            return res.status(401).json({ error: "User " + userName + " not found or invalid !" });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const user = await employee.findOneAndUpdate({ userName: userName }, { password: hashPassword }, { new: true });
            await addLoginAttempt(userName, req.ip, req.get('User-Agent'), true, user.id, null); // Log successful password change
            await addUpdateLoginLockoutStatus(user.id, false); // Log lockout status for successful password change
            res.status(200).json({ message: "Your password has been changed !" });
        }
    } catch (err) {
        console.log(err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
});

module.exports = routes;
