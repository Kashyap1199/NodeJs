const fs = require('fs');

const fileName = 'error.json';
const isFileExists = fs.existsSync(fileName);

function setErrorLog(error) {
    if (isFileExists) {
        // if file is exists then add/update new error log
        try {
            const fileData = require('./error.json');
            if (fileData.length > 0)
                fileData?.push(error);
            else
                fileData = [{ error }];
            fs.writeFile(fileName, JSON.stringify(fileData), function (err) {
                if (err) throw err;
                console.log("File " + fileName + " is updated successfully");
            })
        } catch (err) {
            console.log(err);
            throw err;
        }
    } else {
        // if file is not exists then craeet file and add new error log
        const errLog = [ error ];
        fs.writeFile(fileName, JSON.stringify(errLog), function (err) {
            if (err) throw err;
            console.log("File " + fileName + " is created and updated successfully");
        })
    }
}

module.exports = { setErrorLog }