require('dotenv').config();
require('./DBO/Connection/DB_Connection');
const express = require('express');
const cookie_parser = require('cookie-parser');

const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 8003;
//routes
const user_router = require('./Routes/User_Route');
const device_router = require('./Routes/Device_Route');

app.use(cookie_parser());
app.use(cors());

app.use('/', user_router);
app.use('/', device_router);

app.listen(PORT, ()=>{
    console.log(`Server started on ${PORT}`);
});