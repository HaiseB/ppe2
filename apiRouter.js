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
    apiRouter.route('/users/').get(usersCtrl.listUsers);
    apiRouter.route('/users/profile/').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/profile/').put(usersCtrl.updateUserProfile);

    // Messages routes
    apiRouter.route('/messages/').get(messagesCtrl.listMessages);
    apiRouter.route('/messages/new/').post(messagesCtrl.createMessage);
    // TO DO : update

    // Vehicles routes
    apiRouter.route('/vehicles/').get(vehiclesCtrl.listVehicles);
    // TO DO : list 1 vehicule
    // TO DO : list vehicule disponible (available)
    apiRouter.route('/vehicles/new').post(vehiclesCtrl.createVehicle);
    // TO DO : update

    // Reservations routes
    // TO DO : create
    // TO DO : update
    // TO DO : list
    // TO DO : list en cours (on going)
    // TO DO : list terminée (over)

    return apiRouter;
})();