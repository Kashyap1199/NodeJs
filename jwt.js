const jwt = require('jsonwebtoken');
const { setErrorInTextFile }  = require('./errortext');

// verfiy the token of employee
const jwtMiddleWare = (req, res, next) => {

    // check request headers authorized or not
    const authorizations = req.headers.authorization;
    // console.log('autho ', authorizations);
    if(!authorizations) {
        setErrorInTextFile({ errorName: "JWT Token" , errorMessage: "Token not found", date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        return res.status(404).json({ error: "Token not found" }); 
    }

    // getting token from authorization
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        setErrorInTextFile({ errorName: "Unauthorized", errorMessage: "Unauthorized", date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, "123"); // 123 is secret key
        req.user = decoded;
        next();
    } catch (err) {
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        // setErrorLog({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
}

// create JWT token of employee
function generateToken(username) {
    const jwtToken = jwt.sign(username, "123", { expiresIn: 30000 }); // 123 is secret key
    return jwtToken;
}

module.exports = { jwtMiddleWare, generateToken };