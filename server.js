const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env veriables
dotenv.config({path: './config/config.env'});

// connect to dataBase
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body Parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev loggin middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// mongo sanitize - for sql injection
app.use(mongoSanitize());

// set security headers
app.use(helmet());

// prevent XSS attacks
app.use(xss());

// rate limiting // 100 request per 10 mins
const limiter = rateLimit({
    windowMs: 1000 * 10 * 60, // 10 mins
    max: 100
});

app.use(limiter);

// prevent http param pollution
app.use(hpp());

// enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);


// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    () => {console.log(`server running on ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)}
);

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // close server and exit process
    server.close(() => process.exit(1));
})