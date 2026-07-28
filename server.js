
// express package
// ==================================================

var express = require('express');
var app = express();
const dbConnection = require('./db');
const passport = require('./auth');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const corsOrigin = {
    origin: '*',

    // methods: [
    //   'GET',
    //   'POST',
    // ],

    // allowedHeaders: [
    //     'Content-Type',
    //     'Accept'
    // ],
}

// swagger configurations
const swaggerUIExpress = require('swagger-ui-express');
const swaggerJsDoc = require('./swagger');
app.use('/swagger', swaggerUIExpress.serve, swaggerUIExpress.setup(swaggerJsDoc));

// Allow cors origin
app.use(cors(corsOrigin));

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
    console.log('Welcome to the first nodejs app...');
    res.redirect('/swagger'); // redirect to swagger documentation
})

const Login = require('./routes/loginRoutes');
app.use('/api/login', Login);

const Employee = require('./routes/employeesRoutes');
app.use('/api/employee', Employee);

const Dashboard = require('./routes/dashboardRutes');
app.use('/api/dashboard', Dashboard);

app.listen(process.env.PORT, () => {
    console.log('Application running on ' + process.env.PORT + ' port');
});

