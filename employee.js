const employee = require('./models/employee-model');
const { setErrorInTextFile } = require('./errortext');

const isUserActive = async (userId) => {
  try {
    const user = await getEmployeeById(userId);
    return user.isActive
  } catch(err) {
    console.log('Error: ' + err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
  }
}

const getEmployeeById = async (userId) => {
  try {
    return await employee.findById(userId);
  } catch(err) {
    console.log('Error: ' + err);
    setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
  }
}


module.exports = { isUserActive, getEmployeeById };
