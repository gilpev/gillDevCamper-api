const express = require('express');
const dotenv = require('dotenv');

// Load env veriables
dotenv.config({path: './config/config.env'});

const app = express();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {`server running on ${process.env.NODE_ENV} mode on port ${PORT}`});