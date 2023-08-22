const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');

const user_auth = require('../Authentication/User_Auth');
const dm_user = require('../DBO/Central_User_Device_Sch');
const device_joi = require('../Validation/Device_Joi');
const device_name_valid = require('../Validation/Device_Name');
const pass_valid = require('../Validation/Password');
const license_key_valid = require('../Validation/License_key');
const dm_license_key = require('../DBO/License_Key_Sch');
const {sse_list} = require('./Light_Route');
router.use(body_parser.json());
router.use(cookie_parser());

router.post('/register', async (req, res) => {
    try {
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);

        if (acc_check.code !== 200) {
            const { code, message } = acc_check;
            return res.status(code).json({ message });
        }

        const user_id = acc_check.message;

        const req_body = req.body;
        const joi_check = device_joi.register.validate(req_body);
        if (joi_check.error) {
            return res.status(400).json({ message: joi_check.error.details });
        }
        const { license_key, name, password } = req_body;

        const device_name_check = device_name_valid.validate(name);
        if (device_name_check.code !== 200) {
            const { code, message } = device_name_check;
            return res.status(code).json({ message });
        }

        const pass_check = pass_valid.validate(password);
        if (pass_check.code !== 200) {
            const { code, message } = pass_check;
            return res.status(code).json({ message });
        }

        const license_key_check = await license_key_valid.validate(license_key);
        if (license_key_check.code !== 200) {
            const { code, message } = license_key_check;
            return res.status(code).json({ message });
        }
        const license_key_db = license_key_check.message;

        const user = await dm_user.findById({ _id: user_id });

        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }

        if (user.devices.some(device => device.name === name)) {
            return res.status(409).json({ message: 'device name already exists' });
        }
        const hashed_password = await bcrypt.hash(password, 10);
        //add refresh token for mcu here
        const new_device = {
            name: name,
            password: hashed_password,
            locked: false,
            status: {
                power: false,
                brightness: 30,
                data: []
            }
        };
        user.devices.push(new_device);
        await user.save();

        const device_id = user.devices.find(device => device.name === name)._id;
        if (!device_id) {
            return res.status(500).json({ message: `device with name ${name} could not be created` });
        }

        license_key_db.device_id = device_id;
        await license_key_db.save();

        return res.status(200).json({
            message: {
                name: new_device.name,
                power: new_device.status.power,
                brightness: new_device.status.brightness,
                data: new_device.status.data
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
});
router.delete('/device', async (req, res) => {
    try {
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);
        if (acc_check.code !== 200) {
            const { code, message } = acc_check;
            return res.status(code).json({ message });
        }
        const user_id = acc_check.message;
        const has_name = req.query.hasOwnProperty('name');
        if (!has_name) {
            return res.status(400).json({ message: "Parameter : 'name' is required" });
        }
        const name = req.query.name;
        const device_name_check = device_name_valid.sch_device_name.validate(name);
        if (!device_name_check) {
            return res.status(400).json({ message: 'Device name is invalid' });
        }

        const user = await dm_user.findById({ _id: user_id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const device_index = user.devices.findIndex(device => device.name === name);
        if (device_index === -1) {
            return res.status(404).json({ message: `Device with name : ${name} does not exist` });
        }
        const device_id = user.devices[device_index]._id.toString();

        user.devices = user.devices.filter(device => device.name !== name);
        await user.save();
        //clear session if exists
        const session_index = sse_list.findIndex(device=>device.device_id === device_id);

        if(session_index !== -1){
            sse_list.splice(session_index, 1);
        }
        
        const license_key_db = await dm_license_key.findOne({ device_id });

        if (!license_key_db) {
            return res.status(404).json({ message: 'license key registered to the device not found' });
        }

        license_key_db.device_id = "";
        await license_key_db.save();

        return res.status(200).json({ message: 'Device removed' });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});
router.get('/devices', async (req, res) => {
    try {
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);
        if (acc_check.code !== 200) {
            const { code, message } = acc_check;
            return res.status(code).json({ message });
        }

        const user_id = acc_check.message;
        const user = await dm_user.findById({ _id: user_id }, "devices");

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const devices = user.devices.map(device => { return { name: device.name } });
        return res.status(200).json({ devices });

    } catch (err) {
        return res.status(500).json({ message: err });
    }
});
router.patch('/status', async (req, res) => {
    try {
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);
        if (acc_check.code !== 200) {
            const { code, message } = acc_check;
            return res.status(code).json({ message });
        }
        const user_id = acc_check.message;
        const has_name = req.query.hasOwnProperty('name');
        if (!has_name) {
            return res.status(400).json({ message: "Parameter : 'name' is required" });
        }
        const name = req.query.name;

        const req_body = req.body;
        const joi_check = device_joi.update.validate(req_body);

        if (joi_check.error) {
            return res.status(400).json({ message: joi_check.error.details });
        }
        if (Object.keys(req_body).length === 0) {
            return res.status(400).json({ message: "Request body empty" });
        }
        const { power, brightness, data } = req_body;
        const device_name_check = device_name_valid.sch_device_name.validate(name);

        if (!device_name_check) {
            return res.status(400).json({ message: 'Invalid device name' });
        }

        const user = await dm_user.findById({ _id: user_id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const device_index = user.devices.findIndex(device => device.name === name);
        if (device_index === -1) {
            return res.status(404).json({ message: `Device with device name ${name} not found in the list of registered devices` });
        }

        if (power !== undefined)
            user.devices[device_index].status.power = power;
        if (brightness !== undefined)
            user.devices[device_index].status.brightness = brightness;
        if (data !== undefined && data.length !== 0)
            user.devices[device_index].status.data = data;

        await user.save();
        const device_id = user.devices[device_index]._id.toString();
        console.log(sse_list);
        console.log(`device_id: ${device_id}`);

        const sse_device = sse_list.find(device=>device.device_id === device_id);
        /*console.log(sse_list);
        console.log(`sse_device_id type: ${typeof sse_list[0].device_id}`);
        console.log(`device_id type: ${typeof device_id}`);

        console.log(`sse_Device: ${sse_device}`);
        console.log(`Device status: ${JSON.stringify(user.devices[device_index].status)}`);*/
        if(sse_device){
            sse_device.res.write(`data: ${JSON.stringify(user.devices[device_index].status)}\n\n`);
        }
        return res.status(200).json({ message: 'Device status updated' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
});
router.get('/status', async (req, res) => {
    try {
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);
        if (acc_check.code !== 200) {
            const { code, message } = acc_check;
            return res.status(code).json({ message });
        }
        const user_id = acc_check.message;
        const has_name = req.query.hasOwnProperty('name');
        if (!has_name) {
            return res.status(400).json({ message: "Parameter : 'name' is required" });
        }
        const name = req.query.name;
        const device_name_check = device_name_valid.sch_device_name.validate(name);
        if (!device_name_check) {
            return res.status(400).json({ message: 'Invalid device name' });
        }

        const user = await dm_user.findOne({'_id': user_id, 'devices.name' : name}, {'_id' : 0, 'devices.$' : 1});
        if (!user) {
            return res.status(404).json({ message: `User or device not found` });
        }

        const device_status = user.devices[0].status;
        return res.status(200).json(device_status);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
});
router.get('/statuses', async (req, res) => {
    try {
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);
        if (acc_check.code !== 200) {
            const { code, message } = acc_check;
            return res.status(code).json({ message });
        }
        const user_id = acc_check.message;
        const query = dm_user.findById({ _id: user_id }).select("first_name devices");
        const user = await query.exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const devices_db = user.devices;
        if (!devices_db) {
            return res.status(404).json({ message: 'No registered found' });
        }
        const initials = user.first_name.substring(0, 1);
        const devices = devices_db.map(device => { return { name: device.name, locked: device.locked, ...device.status } });
        res.status(200).json({ initials, devices });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
});
router.patch('/name', async (req, res) => {
    try {
        //access token check
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);
        if (acc_check.code !== 200) {
            const { code, message } = acc_check;
            return res.status(code).json({ message });
        }
        const user_id = acc_check.message;
        const req_body = req.body;
        //req body check
        const joi_check = device_joi.update_name.validate(req_body);
        if (joi_check.error) {
            return res.status(400).json({ message: joi_check.error.details });
        }
        const { old_name, new_name } = req_body;
        const old_name_check = device_name_valid.sch_device_name.validate(old_name);
        if (!old_name_check) {
            return res.status(400).json('Invalid device name');
        }
        const new_name_check = device_name_valid.validate(new_name);
        if (new_name_check.code !== 200) {
            const { code, message } = new_name_check;
            return res.status(code).json({ message });
        }
        //get the user document
        const user = await dm_user.findById({ _id: user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        //check if the new name exists
        if (user.devices.findIndex(device => device.name === new_name) !== -1) {
            return res.status(409).json({ message: `Device with name ${new_name} already exists please try a different name` });
        }
        //get device index
        const device_index = user.devices.findIndex(device => { return device.name === old_name });

        if (device_index === -1) {
            return res.status(404).json({ message: `Device with name : ${old_name} not found` });
        }
        //update the device name

        user.devices[device_index].name = new_name;

        await user.save();
        const message = { name: new_name };
        return res.status(200).json({ message });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
});
router.patch('/password', async (req, res) => {
    try {
        const access_token = req.header('x-auth-token');
        const acc_check = user_auth.verify_access_token(access_token);
        if (acc_check.code !== 200) {
            const { code, message } = acc_check;
            return res.status(code).json({ message });
        }

        const user_id = acc_check.message;
        const req_body = req.body;
        const joi_check = device_joi.update_password.validate(req_body);
        if (joi_check.error) {
            return res.status(400).json({ message: joi_check.error.details });
        }
        const { name, password } = req_body;
        const name_check = device_name_valid.sch_device_name.validate(name);

        if (!name_check) {
            return res.status(400).json('Invalid device name');
        }

        const pass_check = pass_valid.validate(password);
        if (pass_check.code !== 200) {
            const { code, message } = pass_check;
            return res.status(code).json({ message });
        }

        const user = await dm_user.findById({ _id: user_id });

        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }

        const device_index = user.devices.findIndex(device => device.name === name);

        if (device_index === -1) {
            return res.status(404).json({ message: `Device with name : ${name} not found` });
        }

        const hashed_password = await bcrypt.hash(password, 10);

        user.devices[device_index].password = hashed_password;
        await user.save();

        return res.status(200).json({ message: 'Device password changed successfully' });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err });
    }
});

module.exports = router;