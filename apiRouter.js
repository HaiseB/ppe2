// Imports
var express = require('express');
var usersCtrl = require('./routes/usersCtrl');
var messagesCtrl = require('./routes/messagesCtrl');
var vehiclesCtrl = require('./routes/vehiclesCtrl');

// Router
exports.router = (function(){
    var apiRouter = express.Router();

    // Users routes
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/me/').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/me/').put(usersCtrl.updateUserProfile);

    // Messages routes
    apiRouter.route('/messages/').get(messagesCtrl.listMessages);
    apiRouter.route('/messages/new/').post(messagesCtrl.createMessage);

    // Vehicles routes
    apiRouter.route('/vehicles/').get(vehiclesCtrl.listVehicles);
    apiRouter.route('/vehicles/new').post(vehiclesCtrl.createVehicle);
    // TO DO : update

    // Reservations routes
    /// TO DO : create
    // TO DO : update
    // TO DO : list

    return apiRouter;
})();