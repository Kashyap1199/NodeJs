const swaggerJSdoc = require('swagger-jsdoc');
const version = require('./package.json').version;
const description = require('./package.json').description;
const port = process.env.PORT;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node js API',
            version: version,
            description: description
        },
        // for different servers: localhost for development and may have different server like production, test , qa etc...
        servers: [
            {
                url: `http://localhost:${port}/`,
                description: 'local server for development'
            }
        ],
        // for authorizations: pass jwt token to getting the data after authenticate
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer'
                }
            }
        }
    },
    apis: [
        './routes/loginRoutes.js',
        './routes/employeesRoutes.js',
        './routes/dashboardRutes.js',
        './routes/email-verification-routes.js'
    ],
};

const swaggerJSPac = swaggerJSdoc(options);
module.exports = swaggerJSPac;
