const multer = require('multer');

const imageStorage = multer.diskStorage({
    destination: 'images/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})

const upload = multer({ storage: imageStorage });

module.exports = { upload }