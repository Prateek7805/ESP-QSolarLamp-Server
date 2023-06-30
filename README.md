# ESP-QSolarLamp-Server

## Server-side code for a cloud-connected solar lamp
### A lightweight and powerful server-side implementation of the cloud connect ESP-QSolarLamp written in express-nodejs
### Features
* Basic CRUD features like user signup, login, logout, delete account, etc
* Request Body and password validations using [joi](https://www.npmjs.com/package/joi) and [password-validator](https://www.npmjs.com/package/password-validator)
* NoSql MongoDB Schema for User (includes devices) and license_keys/uid for devices.
* Typed using guard clauses (minimum nesting)
* Authentication using JWT with refresh tokens and token rolling, with multi-device support.

### To do
* Adding user-device route
* Adding device route to access status
* Adding device-level authentication
