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
const light_router = require('./Routes/Light_Route');


app.use(cookie_parser());
// Allow requests from the specific origin (your React app's domain)
const allowed_clients = process.env.ALLOWED_CLIENT_END_POINTS;

const allowed_clients_array = allowed_clients.split(',');

// CORS options to handle credentials
const cors_options = {
  origin: allowed_clients_array,
  credentials: true, // Allow cookies, authorization headers, etc.
};

app.use(cors(cors_options));

app.use('/', user_router);
app.use('/device', device_router);
app.use('/light', light_router);

app.listen(PORT, ()=>{
    console.log(`Server started on ${PORT}`);
});