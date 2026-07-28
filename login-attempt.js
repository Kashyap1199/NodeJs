const { setErrorInTextFile } = require('./errortext');
const LoginAttemptLogModel = require('./models/login-attempt-log-model');
const LoginLockoutStatusModel = require('./models/login-lockout-status-model');
const {
  LOGIN_LOCKOUT_DURATION_MINUTES
 } = require('./constant/login-attempt.constants');

const addLoginAttempt = async (userName, ipAddress, userAgent, isSuccess, loginUserId = null, failedReason = null) => {
    try {
        const loginAttempt = new LoginAttemptLogModel({
            attemptedUsername: userName,
            ipAddress: ipAddress,
            userAgent: userAgent,
            isSuccess: isSuccess,
            loginUserId: loginUserId,
            failedReason: failedReason
        });
        await loginAttempt.save();

        if (isSuccess) {
          const user = await getLoginLockoutStatusUserById(loginUserId);
          user.lastSuccessfulLoginDate = loginAttempt.attemptDate;
          await user.save();
        }
    } catch (err) {
        console.error('Error in addLoginAttempt:', err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
    }
};

const addUpdateLoginLockoutStatus = async (userId, isLocked) => {
    try {

      const failedAttempt = await getLoginAttemptUser(userId, false);
      const sucessAttempt = await getLoginAttemptUser(userId, true);
      const lockoutStatusUser = await getLoginLockoutStatusUserById(userId);

    if (lockoutStatusUser && !lockoutStatusUser.isLocked) {
        lockoutStatusUser.failedAttemptCount += 1;
        lockoutStatusUser.remainingAttempts = Math.max(0, 5 - lockoutStatusUser.failedAttemptCount);
        lockoutStatusUser.lastFailedLoginDate = failedAttempt?.attemptDate;
        lockoutStatusUser.lastSuccessfulLoginDate = sucessAttempt?.attemptDate ?? null;
        if (lockoutStatusUser.remainingAttempts == 0) {
          lockoutStatusUser.isLocked = true;
          lockoutStatusUser.lockoutStartDate = new Date();
          lockoutStatusUser.lockoutEndDate = new Date(Date.now() + LOGIN_LOCKOUT_DURATION_MINUTES * 60 * 1000); // minutes, seconds, miliseconds
        }
        await lockoutStatusUser.save();
      } else {
        const lockoutStatus = new LoginLockoutStatusModel({
            loginUserId: userId,
            failedAttemptCount: 1,
            remainingAttempts: 4,
            lastFailedLoginDate: failedAttempt?.attemptDate,
            lastSuccessfulLoginDate: sucessAttempt?.attemptDate ?? null,
        });
        await lockoutStatus.save();
      }
    } catch (err) {
        console.error('Error in addUpdateLoginLockoutStatus:', err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
    }
};

const getLoginAttemptUser = async (userId, isSuccess) => {
    try {
        const attempts = await LoginAttemptLogModel.findOne({ loginUserId: userId, isSuccess: isSuccess })
            .sort({ attemptDate: -1 })
        return attempts;
    } catch (err) {
        console.error('Error in getLoginAttemptUser:', err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
        return [];
    }
};

const getLoginLockoutStatusUserById = async (userId) => {
  try {
    return await LoginLockoutStatusModel.findOne({ loginUserId: userId }) ?? null;
  } catch(err) {
    console.error('Error in getLoginLockoutStatusUserById:', err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
    return null;
  }
}

const isUserLockedOut = async (userId) => {
    try {
        const lockoutStatus = await LoginLockoutStatusModel.findOne({ loginUserId: userId }).sort({ createdDate: -1 });
        return lockoutStatus ? lockoutStatus.isLocked : false;
    } catch (err) {
        console.error('Error in isUserLockedOut:', err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
        return false;
    }
};

const resetLoginLockoutStatusByUserId = async (userId) => {
  try {
    const user = await getLoginLockoutStatusUserById(userId);
    user.isLocked = false;
    user.failedAttemptCount = 0;
    user.remainingAttempts = 5;
    user.lockoutStartDate = null;
    user.lockoutEndDate = null;
    await user.save();
  } catch(err) {
    console.error('Error in resetLoginLockoutStatusByUserId:', err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
  }
}

const getRemainingTimeForLockoutStatusByUserId = async (userId) => {
  try {
    const user = await getLoginLockoutStatusUserById(userId);

    const now = new Date();
    const endTime = new Date(user.lockoutEndDate);
    const remainingMs = endTime - now;

    if (remainingMs > 0) {
        const minutes = Math.floor(remainingMs / (1000 * 60));
        console.log(`${minutes} minutes`);
        return `${minutes} minutes`
    }

    return null;
  } catch(err) {
    console.error('Error in getRemainingTimeForLockoutStatusByUserId:', err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
  }
}

const isLoginLockoutsStatusIsExpired = async (userId) => {
  try {
    const user = await getLoginLockoutStatusUserById(userId);
    if (user.lockoutEndDate) {
      const now = new Date();
      const endTime = new Date(user.lockoutEndDate);
      const remainingMs = endTime - now;
      if (remainingMs > 0) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  } catch(err) {
    console.error('Error in isLoginLockoutsStatusIsExpired:', err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString() });
  }
}

module.exports = {
    addLoginAttempt,
    getLoginAttemptUser,
    addUpdateLoginLockoutStatus,
    isUserLockedOut,
    getLoginLockoutStatusUserById,
    resetLoginLockoutStatusByUserId,
    getRemainingTimeForLockoutStatusByUserId,
    isLoginLockoutsStatusIsExpired
};
