const express = require('express');
const dotenv = require('dotenv');

// Route files
const bootcamps = require('./routes/bootcamps');

// Load env veriables
dotenv.config({path: './config/config.env'});

const app = express();

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {`server running on ${process.env.NODE_ENV} mode on port ${PORT}`});