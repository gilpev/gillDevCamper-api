const ErrorResponse = require('../utills/errorResponse');
const path = require('path');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utills/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        res.status(200).json(res.advancedResults);
});

// @desc        Get single bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        
        if(!bootcamp) {
            // we return because next() will return a response!
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404 ));
        }

        res.status(200).json({
            success: true,
            data: bootcamp
        });
});

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
        // Add user to req.body => we have access to req.user because of our middleware protect!
        req.body.user = req.user.id;

        // check for published bootcamp
        const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

        // if the user is not an admin, they can only add one
        if(publishedBootcamp && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`The user with id ${req.user.id} as already published a bootcamp`, 400)
            );
        }

        const bootcamp = await Bootcamp.create(req.body);

        res.status(201).json({
            success: true,
            data: bootcamp
        });
});

// @desc        Update single bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
        let bootcamp = await Bootcamp.findById(req.params.id);
    
        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404 ));
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 
                401)
            );
        }

        bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
    
        res.status(200).json({
            success: true,
            data: bootcamp
        });
});

// @desc        Delete single bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
    
        if(!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404 ));
        }

        // Make sure user is bootcamp owner
        if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next(
                new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 
                401)
            );
        }

        bootcamp.remove();
    
        res.status(200).json({
            success: true,
            data: {}
        });
});

// @desc        GET Bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lng = loc[0].longitude;
    const lat = loc[0].latitude;

    // Calc redius by radians
    // Divide distance by radius of earth
    // Earth radius = 3,963 miles / 6,378 kilometres
    const radius = distance / 3693;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });

});

// @desc        UPLOAD a photo for bootcamp
// @route       PUT /api/v1/bootcamps/:id/photo
// @access      Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404 ));
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 
            401)
        );
    }

    if(!req.files){
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;

    // check file type
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse('Please upload an image file'));
    }

    // Check file size
    if(file.size > process.env.MAX_FILE_UPLOAD){
        next(
            new ErrorResponse(`Please upload a file less then ${process.env.MAX_FILE_UPLOAD}`,
            400)
        );
    }

    // Create a custom file name
    file.name = `bootcamp_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.log(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});