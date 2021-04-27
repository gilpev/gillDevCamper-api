const express = require('express');
const router = express.Router();
const {
    getBootcamp,
    getBootcamps, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Include other resource router
const courseRouter = require('./courses');

// Protect route middleware
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource router
router.use('/:bootcampId/courses', courseRouter);

// Base route => /api/v1/bootcamps
router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

router  
    .route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
    .route('/')
    .get( advancedResults(Bootcamp, 'courses') , getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
    .route('/:id')
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)
    .get(getBootcamp);


module.exports = router;


// Base route => /api/v1/bootcamps

// router.get('/', (req, res) => {
//      res.status(200).json({ success: true, msg: `get all bootcamps` });
// });

// router.get('/:id', (req, res) => {
//     res.status(200).json({ success: true, msg: `get bootcamp with id: ${req.params.id}` });
// });

// router.post('/', (req, res) => {
//     res.status(200).json({ success: true, msg: 'Create new bootcamp' });
// });

// router.put('/:id', (req, res) => {
//     res.status(200).json({ success: true, msg: `update bootcamp ${req.params.id}` });
// });

// router.delete('/:id', (req, res) => {
//     res.status(200).json({ success: true, msg: `delete bootcamp ${req.params.id}` });
// });