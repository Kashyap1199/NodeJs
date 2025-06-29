const fs = require('fs');

function setErrorInTextFile(error) {

    const fileName = "error.txt";
    const errorMessage = "\n" + JSON.stringify(error);

    fs.appendFile(fileName, errorMessage, (err) => {
        if (err) throw err;
        console.log("Error added in file: " + fileName);
    });
}

module.exports = { setErrorInTextFile }