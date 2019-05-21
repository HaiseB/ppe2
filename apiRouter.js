// Imports
var express = require('express');
var usersCtrl = require('./routes/usersCtrl');
var messagesCtrl = require('./routes/messagesCtrl');
var vehiclesCtrl = require('./routes/vehiclesCtrl');
var reservationsCtrl = require('./routes/reservationsCtrl');

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
    apiRouter.route('/messages/read/').put(messagesCtrl.messageConsulted);

    // Vehicles routes
    apiRouter.route('/vehicles/').get(vehiclesCtrl.listVehicles);
    apiRouter.route('/vehicles/search').patch(vehiclesCtrl.findVehicleById);
    apiRouter.route('/vehicles/available/').get(vehiclesCtrl.vehiclesAvailable);
    apiRouter.route('/vehicles/new').post(vehiclesCtrl.createVehicle);
    apiRouter.route('/vehicles/update').put(vehiclesCtrl.updateVehicle);

    // Reservations routes
    apiRouter.route('/reservations/new/').post(reservationsCtrl.createReservation);
    apiRouter.route('/reservations/end/').put(reservationsCtrl.endReservation);
    apiRouter.route('/reservations/').get(reservationsCtrl.listReservations);
    apiRouter.route('/reservations/ongoing').get(reservationsCtrl.ongoingReservations);
    // TO DO : list terminée (over)

    return apiRouter;
})();