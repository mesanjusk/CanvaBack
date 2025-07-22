const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');


const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary.js');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mern-images',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

router.get('/check-mobile', studentController.checkMobileNumber);
router.post('/', upload.array('photos', 10), studentController.createStudent);
router.get('/', studentController.getStudents);
router.get('/:uuid', studentController.getStudent);
router.put('/:uuid', studentController.updateStudent); 
router.delete('/:uuid', studentController.deleteStudent);


module.exports = router;
