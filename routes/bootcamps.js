const express = require('express');
const router = express.Router();
const {
    getBootcamp,
    getBootcamps, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp
} = require('../controllers/bootcamps');

// Base route => /api/v1/bootcamps
router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamp);

router
    .route('/:id')
    .put(updateBootcamp)
    .delete(deleteBootcamp)
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