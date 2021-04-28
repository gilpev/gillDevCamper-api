const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utills/geocoder');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxLength: [50, 'Name can not be more than 50 Characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a Description'],
        maxLength: [500, 'Description can not be more than 500 Characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP r HTTPS'
        ]
    },
    phone: {
        type: String,
        maxLength: [20, 'Phone number can not be longer than 20 Characters long']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        // Geojson point
        type: {
            type: String,
            enum: ['Point'],
            required: false
        },
        coordinates: {
            type: [Number],
            required: false,
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        // Array of strings
        type: [String],
        required: false,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    avarageRating: {
        type: Number,
        min: [1, 'Rating most be at least 1'],
        max: [10, 'Rating can not be more than 10']
    },
    avarageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    averageCost: {
        type: Number
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Cretae bootcamp slug from the name
// pre is used to run before somthing runs, in this case before save
// we use regular function syntext because arrow func manage scope diferenntly
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Geocode & create location field
BootcampSchema.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].state,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode,
    }

    // Do not save address in DB => we use it to create a location like above
    // and so we dont need to save the address itself to data base
    this.address = undefined;
    next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
    console.log(`Courses are being removed from bootcamp ${this._id}`);
    await this.model('Course').deleteMany({ bootcamp: this._id });
    next();
})

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);