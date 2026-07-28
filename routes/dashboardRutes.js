const express = require('express');
const routes = express.Router();
const { jwtMiddleWare } = require('../jwt');
const employee = require('../models/employee-model');
const { setErrorInTextFile } = require('../errortext');

/**
 * @swagger
 * /api/dashboard/getTotalEmployees:
 *  get:
 *    security:
 *        - BearerAuth: []
 *    tags:
 *        - Dashboard
 *    summary: Employee details
 *    description: Retrieve a total employee, total active employees and total deactive employees from the database.
 *    responses:
 *       200:
 *          description: Successful response with a list of employees
 *       400:
 *          description: Response with Bad request
 *       404:
 *          description: Response with not found like token
 *       500:
 *          description: Response with Internal server error
 */

routes.get('/getTotalEmployees', jwtMiddleWare, async function(req, res) {
    try {
        const totalEmployees = await employee.countDocuments({});
        const totalIsActiveEmployees = await employee.countDocuments({ isActive: true });
        const totalDeactiveEmployees = await employee.countDocuments({ isActive: false });
        const data = [
            { key: "totalEmployees", displayName: "Total Employees", value: totalEmployees },
            { key: "totalIsActiveEmployees", displayName: "Total Active Employees", value: totalIsActiveEmployees },
            { key: "totalDeactiveEmployees", displayName: "Total Deactive Employees", value: totalDeactiveEmployees }
        ]
        res.status(200).json({ data });
    } catch(err) {
        console.log(err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
});

module.exports = routes;
