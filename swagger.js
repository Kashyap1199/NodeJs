const swaggerJSdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node js API',
            version: '1.0.0',
            description: 'This is first API using Node JS application'
        },
        // for different servers: localhost for development and may have different server like production, test , qa etc...
        servers: [
            {
                url: 'http://localhost:3000/',
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
    apis: ['./routes/employeesRoutes.js'],
};

const swaggerJSPac = swaggerJSdoc(options);
module.exports = swaggerJSPac;