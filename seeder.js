const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load Models
const Bootcamp = require('./models/Bootcamp');

// connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Read JSON data
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`), 'utf-8');

// Import into DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        console.log('data imported...'.green.inverse);
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

// Delete data
const deleteData = async () => {
    try {
        // when not given id's it will delete all!
        await Bootcamp.deleteMany();
        console.log('data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.log(err);
    }
}

if(process.argv[2] === '-i'){
    importData();
} else if( process.argv[2] === '-d') {
    deleteData();
}