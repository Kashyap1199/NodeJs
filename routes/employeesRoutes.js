const express = require('express');
const routes = express.Router();
const employee = require('./../models/employee');
const { jwtMiddleWare, generateToken } = require('../jwt');
const { setErrorInTextFile } = require('../errortext');
const bcrypt = require('bcrypt');
const { upload } = require('../multer');
const fs = require('fs');

/**
 * @swagger
 * /api/employee/:
 *   get:
 *     security:
 *           - BearerAuth: [] 
 *     tags:
 *        - Employee   
 *     summary: Get a list of employees
 *     description: Retrieve a list of employees from the database.
 *     parameters:
 *          - in: query
 *            name: pageNo
 *            required: true
 *            default: 1
 *            schema:
 *                type: number
 *          - in: query
 *            name: pageSize
 *            required: true
 *            default: 5
 *            schema:
 *                type: number
 *          - in: query
 *            name: sortColumn
 *            default: firstName
 *            schema:
 *                type: string
 *     responses:
 *       200:
 *         description: Successful response with a list of employees
 *       400:
 *         description: Response with Bad request
 *       404:
 *         description: Response with not found like token 
 *       500:
 *         description: Response with Internal server error
 *      
 */

// get method
routes.get('/', jwtMiddleWare, async function (req, res) {
    try {
        const pageNo = parseInt(req.query.pageNo);
        const pageSize = parseInt(req.query.pageSize);
        const sortColumn = req.query.sortColumn;
        const skipRecords = pageNo == 1 ? 0 : (pageNo - 1) * pageSize;
        const totalRecords = await employee.countDocuments({});
        const data = await employee.find().limit(pageSize).skip(skipRecords).sort(sortColumn);
        res.status(200).json({ data, pageNo, pageSize, totalRecords });
    } catch (err) {
        console.log(err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
})

/**
 * @swagger
 * /api/employee:
 *      post:
 *          tags:
 *               - Employee 
 *          summary: Get new inserted employee
 *          description: Get new inserted employee
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                        type: object
 *                        properties:
 *                              firstName: 
 *                                  type: string
 *                                  required: true
 *                              lastName: 
 *                                   type: string
 *                                   required: true
 *                              emailId:
 *                                   type: string
 *                                   required: true,
 *                                   unique: true
 *                              mobileNo:
 *                                   type: number
 *                                   required: true
 *                                   unique: true
 *                              designation: 
 *                                   type: string
 *                                   required: true
 *                              userName: 
 *                                   type: string
 *                                   required: true
 *                                   unique: true
 *                              password: 
 *                                   type: string
 *                                   required: true
 *                              image:
 *                                   type: string
 *          responses:
 *              200: 
 *                  description: Success response with the retrive new inserted employee
 *              400:
 *                  description: Response with Bad request
 *              404:
 *                  description: Response with not found like token 
 *              500:
 *                  description: Response with Internal server error
 */

// post method
routes.post('/', upload.single('image'), async (req, res) => {
    try {
        const data = req.body;
        const newEmployee = new employee(data);

        // if image/file is exists then converting in base64
        if (req.file) {  
            const employeeImage = fs.readFileSync(req.file.path);
            newEmployee.image = {
                imageBase64: employeeImage.toString('base64'),  // converting image in base64 format
                storedOnServerPath: req.file.path,
                contentType: "base64"
            }
        }
        await newEmployee.save();
        res.status(200).json({ message: "New employee successfully inserted !" });
    } catch (err) {
        console.log('Error: ' + err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
});

/**
 * @swagger
 * /api/employee/{designationType}:
 *      get:
 *          security:
 *              - BearerAuth: []
 *          tags:
 *               - Employee 
 *          summary: Get employee 
 *          description: Get employee matches with designationType
 *          parameters:
 *              - in: path
 *                name: designationType
 *                required: true
 *                schema:
 *                  type: string 
 *              - in: query
 *                name: pageNo
 *                required: true
 *                schema:
 *                  type: string
 *                default: 1
 *              - in: query
 *                name: pageSize
 *                required: true
 *                schema:
 *                  type: string      
 *                default: 5
 *          responses:
 *              200: 
 *                  description: Success response with the retrive new inserted employees
 *              400:
 *                  description: Response with Bad request
 *              404:
 *                  description: Response with not found like token 
 *              500:
 *                  description: Response with Internal server error
 */

// get method - getting data based on matches on designation
routes.get('/:designationType', jwtMiddleWare, async (req, res) => {
    try {
        const designationType = req.params.designationType;
        const pageNo = parseInt(req.query.pageNo);
        const pageSize = parseInt(req.query.pageSize);
        const skipRecords = pageNo == 1 ? 0 : (pageNo - 1) * pageSize;
        const totalRecords = await employee.countDocuments({ designation: designationType });
        if (designationType === 'Developer' || designationType === 'Tester' || designationType === 'Team leader' || designationType === 'Designer') {
            const data = await employee.find({ designation: designationType }).limit(pageSize).skip(skipRecords);
            res.status(200).json({ data, pageNo, pageSize, totalRecords });
        } else {
            console.log('Designation is invalid');
            res.status(400).json({ message: 'Designation is invalid' });
        }
    } catch (err) {
        console.log(err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
});

/**
 * @swagger
 * /api/employee/{id}:
 *      put:
 *          security:
 *              - BearerAuth: []
 *          tags:
 *               - Employee 
 *          summary: Get updated record
 *          description: Get the new updated record
 *          parameters:
 *              - in: path
 *                name: id
 *                required: true
 *                schema:
 *                  type: string
 *          requestBody: 
 *                required: true
 *                content: 
 *                  application/json:
 *                      schema: 
 *                          type: object
 *                          properties:
 *                                  firstName: 
 *                                      type: string
 *                                      required: true
 *                                  lastName: 
 *                                      type: string
 *                                      required: true
 *                                  emailId:
 *                                      type: string
 *                                      required: true
 *                                      unique: true
 *                                  mobileNo:
 *                                      type: number
 *                                      required: true
 *                                      unique: true
 *                                  designation: 
 *                                      type: string
 *                                      required: true
 *                                  userName: 
 *                                      type: string
 *                                      required: true
 *                                  password: 
 *                                      type: string
 *                                      required: true 
 *          responses:
 *              200: 
 *                  description: Success response with the retrive new inserted employee
 *              400:
 *                  description: Response with Bad request
 *              404:
 *                  description: Response with not found like token 
 *              500:
 *                  description: Response with Internal server error
 *              
 */

// update method
routes.put('/:id', jwtMiddleWare, async (req, res) => {
    try {
        const id = req.params.id;
        const updateNewEmployee = req.body;

        if (updateNewEmployee?.password) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(updateNewEmployee.password, salt);
            updateNewEmployee.password = hashPassword;
        }

        const response = await employee.findByIdAndUpdate(id, updateNewEmployee, {
            new: true,  // return the new updated document/records
            runValidators: true  //for the validation required
        });

        if (!response) {
            setErrorInTextFile({ errorName: "Update Record", errorMessage: "Not found", date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
            return res.status(400).json({ message: 'Not found' });
        }

        console.log(response);
        console.log('Success: Record is successfully updated !');
        res.status(200).json({ message: "Employee successfully updated !" });
        // res.status(200).json(response);
    } catch (err) {
        console.log(err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
})

/**
 * @swagger
 * /api/employee/{id}:
 *  delete:
 *      security:
 *          - BearerAuth: []
 *      tags:
 *        - Employee   
 *      summary: Delete record by id
 *      description: Get the deleted record by id
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true  
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Successful response with delete record by id
 *          400:
 *              description: Response with bad request - not pass correct parameter
 *          404:
 *              description: Response with employee not found or token not found
 *          500:
 *              description: Response with internal server error
 *              
 */

// delete method
routes.delete('/:id', jwtMiddleWare, async (req, res) => {
    try {
        const id = req.params.id;
        const response = await employee.findByIdAndDelete(id, {
            new: true // return the new deleted document/records
        });

        if (!response) {
            setErrorInTextFile({ errorName: "Delete Record", errorMessage: "Not found", date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
            return res.status(404).json({ message: 'Not found' });
        }

        console.log(response);
        console.log('Success: Record is successfully deleted !');
        res.status(200).json({ message: "Employee successfully deleted !" });
        // res.status(200).json(response);
    } catch (err) {
        console.log(err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
})

/**
 * @swagger
 * /api/employee/login:
 *  post:
 *          tags:
 *            - Employee
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

// login
routes.post('/login', async (req, res) => {

    // taking credentials
    const { userName, password } = req.body;

    // checking employee is exists or not 
    const user = await employee.findOne({ userName: userName });

    if (!user) {
        setErrorInTextFile({ errorName: "User not foud", errorMessage: "User not found or unauthorized !", date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        return res.status(401).json({ error: "User not found or unauthorized !" });
    } else if (!(await user.comparedPassword(password))) {
        setErrorInTextFile({ errorName: "Invalid credentials", errorMessage: "Username or password incorrect", date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        return res.status(401).json({ error: "Username or password incorrect" });
    }

    try {
        const payload = {
            id: employee.id,
            username: employee.userName
        }
        const token = await generateToken(payload);
        res.json({ token });
    } catch (err) {
        comsole.log(err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
})

/**
 * @swagger
 * /api/employee/profile/{username}:
 *  get:
 *      security:
 *          - BearerAuth: []
 *      tags:
 *        - Employee
 *      summary: Get the profile details about the employee
 *      description: Get the profile details about the user by username
 *      parameters:
 *          - in: path
 *            name: username
 *            required: true
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: Successful response with get employee details
 *          400:
 *              description: Response with bad request - pass invalid parameter
 *          404:
 *              description: Response with not found - employee not found
 *          500:
 *              description: Response with internal server error
 */
// profile route - getting data based on matches on id
routes.get('/profile/:username', jwtMiddleWare, async function (req, res) {
    try {
        const username = req.params.username;
        const response = await employee.findOne({ userName: username });

        if (!response) {
            res.status(404).json({ errorName: "User not foud" });
        }
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        setErrorInTextFile({ errorName: err.name, errorMessage: err.message, date: new Date().toLocaleString(), route: req.originalUrl, method: req.method });
        res.status(500).json({ errorName: err.name, errorMessage: err.message });
    }
})

module.exports = routes;