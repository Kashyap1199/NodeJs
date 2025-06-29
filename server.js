
// express package
// ==================================================

var express = require('express');
var app = express();
const dbConnection = require('./db');
const passport = require('./auth');
const bodyParser = require('body-parser');
require('dotenv').config();

// swagger configurations
const swaggerUIExpress = require('swagger-ui-express');
const swaggerJsDoc = require('./swagger');
app.use('/swagger', swaggerUIExpress.serve, swaggerUIExpress.setup(swaggerJsDoc));

// Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option
app.use(bodyParser.json());

//Middleware function
const middleWare = (req, res, next) => {
    console.log('Date: ' + new Date().toLocaleString() + ' method called is ' + req.originalUrl);
    next();
}

// app.use(middleWare);
// app.use(passport.initialize());

const localAuthMiddleWare = passport.authenticate('local', { session: false });
app.get('/', (req, res) => {
    res.send('Welcome to the first nodejs app...');
    console.log('Welcome to the first nodejs app...');
})

const Employee = require('./routes/employeesRoutes');
app.use('/api/employee', Employee);

app.listen(process.env.PORT, () => {
    console.log('Application running on ' + process.env.PORT + ' port');
});

