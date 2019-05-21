// Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

var Sequelize= require('sequelize');
const Op = Sequelize.Op;

// Constants
const TITLE_LIMIT=2;
const CONTENT_LIMIT=8;
const ITEMS_LIMIT   = 50;

//Routes
module.exports = {
    createReservation: function(req, res){
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        // Params
        var status = 'En cours';
        var vehicleId = req.body.vehicleId;
        var start = req.body.start;
        var end = req.body.end;

        asyncLib.waterfall([
            function(done){
                models.users.findOne({
                    where: {id:userId}
                }).then(function(userFound){
                    done(null, userFound);
                }).catch(function(err){
                    return res.status(400).json({'error' : 'unable to verify user' });
                });
            },
            function(userFound, done){
                if (userFound){
                    var userId = userFound.id;
                    done(null, userFound);
                } else {
                    return res.status(400).json({'error' : 'user not found' });
                }
            },
            function(userFound,done){
                models.vehicles.findOne({
                    where: {id:vehicleId}
                }).then(function(vehicleFound, userFound){
                    done(null, vehicleFound, userFound);
                }).catch(function(err){
                    return res.status(400).json({'error' : 'unable to verify vehicle' });
                });
            },
            function(vehicleFound, userFound, done){
                if (vehicleFound){
                    if (start == null){
                        var start = Date.now();
                    }
                    if (end == null){
                        var today = new Date();
                        var strToday = today.toString();
                        var year = strToday.substring(11, 15);
                        var month = strToday.substring(8, 10);
                        var day = strToday.substring(4, 7);
                        var concatenate = month+' '+day+', '+year+' 20:00:00';
                        var end = new Date(concatenate);
                    }
                    vehicleFound.update({
                            locked : 1
                        })
                    var newReservation = models.reservations.create({
                        status : status,
                        start : start,
                        end : end,
                        userId : userId,
                        vehicleId : vehicleId
                        })
                        .then(function(newReservation){
                            done(newReservation);
                        });
                } else {
                    return res.status(400).json({'error' : 'vehicle not found' });
                }
            },
        ], function(newReservation){
            if (newReservation){
                return res.status(201).json(newReservation);
            } else {
                return res.status(400).json({'error' : 'cannot post reservation' });
            }
        });
    },

    listReservations: function(req, res){
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);
        var order = req.query.order;

        if (limit > ITEMS_LIMIT) {
            limit = ITEMS_LIMIT;
        }

        models.reservations.findAll({
            order: [(order != null) ? order.split(':') : ['end', 'ASC']],
            attributes: (fields !=='*' && fields !=null) ? fields.split(','):null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,
            include: [{
                model: models.users,
                attributes: [ 'name' ],
            },{
                model: models.vehicles,
                attributes: [ 'license_plate','model' ]
            }]
            }).then(function(reservations){
                if (reservations){
                    res.status(200).json(reservations);
                } else {
                    return res.status(404).json({'error' : 'no reservations found' });
                }
        }).catch(function(err){
            console.log(err);
            res.status(500).json({'error' : 'invalid fields' });
        });
    },

    ongoingReservations: function(req, res){
        var fields = req.query.fields;
        var order = req.query.order;

        models.reservations.findAll({
            where: {status: 'En cours'},
            order: [(order != null) ? order.split(':') : ['end', 'ASC']],
            attributes: (fields !=='*' && fields !=null) ? fields.split(','):null,
            include: [{
                model: models.users,
                attributes: [ 'name' ],
            },{
                model: models.vehicles,
                attributes: [ 'license_plate','brand','model','kilometers' ]
            }]
            }).then(function(reservations){
                if (reservations){
                    res.status(200).json(reservations);
                } else {
                    return res.status(404).json({'error' : 'no reservations found' });
                }
        }).catch(function(err){
            console.log(err);
            res.status(500).json({'error' : 'invalid fields' });
        });
    },

    endReservation: function(req, res){
        // Params
        var status = 'Over';
        var vehicleId = req.body.vehicleId;
        var kilometers = req.body.kilometers;
        var reservationId = req.body.reservationId;
        var end = req.body.end;

        asyncLib.waterfall([
            function(done){
                models.vehicles.findOne({
                    where: {id:vehicleId}
                }).then(function(vehicleFound){
                    done(null, vehicleFound);
                }).catch(function(err){
                    return res.status(500).json({'error' : 'unable to verify vehicle' });
                });
            },
            function(vehicleFound, done){
                models.reservations.findOne({
                    where: {id:reservationId}
                }).then(function(reservationFound){
                    done(null, vehicleFound, reservationFound);
                }).catch(function(err){
                    return res.status(500).json({'error' : 'unable to verify reservation' });
                });
            },
            function(vehicleFound, reservationFound, done){
                if (vehicleFound){
                    if (end == null){
                        var end = Date.now();
                    }
                    /*
                    else {
                        var today = new Date();
                        var strToday = today.toString();
                        var year = strToday.substring(11, 15);
                        var month = strToday.substring(8, 10);
                        var day = strToday.substring(4, 7);
                        var concatenate = month+' '+day+', '+year+' '+end+':00';
                        var end = new Date(concatenate);
                    }*/
                    vehicleFound.update({
                            locked : 0,
                            kilometers : (kilometers ? kilometers : vehicleFound.kilometers)
                        })
                    reservationFound.update({
                        status : 'Terminée',
                        end : end
                        })
                        .then(function(){
                            done(reservationFound);
                        });
                } else {
                    return res.status(400).json({'error' : 'vehicle not found' });
                }
            },
        ], function(reservationFound){
            if (reservationFound){
                return res.status(201).json({'sucess' : 'Reservation ended'});
            } else {
                return res.status(400).json({'error' : 'cannot update reservation' });
            }
        });
    }
}