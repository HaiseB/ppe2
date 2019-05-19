// Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

// Constants

//Routes
module.exports={
    createVehicle: function(req, res){

        // Params
        var type = req.body.type;
        var license_plate = req.body.license_plate;
        var model = req.body.model;
        var brand = req.body.brand;
        var kilometers = req.body.kilometers;
        var autonomy = req.body.autonomy;
        var fuel = req.body.fuel;

        if (type == null || license_plate == null || kilometers == null || autonomy == null || fuel == null){
            return res.status(400).json({'error' : 'missing parameters' });
        }

        /**
         * TO DO : Vérification des parametres
         */

        models.vehicles.findOne({
            attributes: ['license_plate'],
            where : { license_plate: license_plate }
        })
        .then(function(vehicleFound) {
            if (!vehicleFound) {
                var newVehicule = models.vehicles.create({
                    type : type,
                    license_plate : license_plate,
                    model : model,
                    brand : brand,
                    kilometers : kilometers,
                    autonomy : autonomy,
                    fuel : fuel,
                    locked : 0
                    })
                    .then(function(newVehicle){
                        return res.status(201).json({
                            'vehicleId': newVehicle.id
                        })
                    })
                    .catch(function(err){
                        return res.status(500).json({'error' : 'cannot add vehicle' });
                    });
            } else {
                return res.status(409).json({'error' : 'vehicle already exist' });
            }
        })
        .catch(function(err) {
            return res.status(500).json({'error' : 'cannot create vehicle' });
        });
    },

    listVehicles: function(req, res){
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var order = req.query.order;

        models.vehicles.findAll({
            order: [(order != null) ? order.split(':') : ['type', 'ASC']],
            attributes: (fields !=='*' && fields !=null) ? fields.split(','):null,
            limit: (!isNaN(limit)) ? limit : null
            }).then(function(vehicles){
                if (vehicles){
                    res.status(200).json(vehicles);
                } else {
                    return res.status(404).json({'error' : 'no vehicle found' });
                }
        }).catch(function(err){
            console.log(err);
            res.status(500).json({'error' : 'invalid fields' });
        });
    },

    vehiclesAvailable: function(req, res){
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var order = req.query.order;

        models.vehicles.findAll({
            order: [(order != null) ? order.split(':') : ['type', 'ASC']],
            attributes: (fields !=='*' && fields !=null) ? fields.split(','):null,
            limit: (!isNaN(limit)) ? limit : null,
            where: { locked:0 }
            }).then(function(vehicles){
                if (vehicles){
                    res.status(200).json(vehicles);
                } else {
                    return res.status(404).json({'error' : 'no vehicle found' });
                }
        }).catch(function(err){
            console.log(err);
            res.status(500).json({'error' : 'invalid fields' });
        });
    },

    updateVehicle: function(req, res){
        // Gettinh auth header
        var headerAuth = req.headers['authorization'];

        // Params
        var type = req.body.type;
        var license_plate = req.body.license_plate;
        var model = req.body.model;
        var brand = req.body.brand;
        var kilometers = req.body.kilometers;
        var autonomy = req.body.autonomy;
        var locked = req.body.locked;

        asyncLib.waterfall([
            function(done){
                models.vehicles.findOne({
                    attributes: ['id','type','license_plate','model','brand','kilometers','autonomy','locked'],
                    where: { license_plate }
                }).then(function(vehicleFound){
                    done(null, vehicleFound);
                }).catch(function(err){
                    return res.status(500).json({'error' : 'enable to find vehicle' });
                });
            },
            function(vehicleFound, done){
                if (vehicleFound){
                    vehicleFound.update({
                        type : (type ? type : vehicleFound.type),
                        license_plate : (license_plate ? license_plate : vehicleFound.license_plate),
                        model : (model ? model : vehicleFound.model),
                        brand : (brand ? brand : vehicleFound.brand),
                        kilometers : (kilometers ? kilometers : vehicleFound.kilometers),
                        autonomy : (autonomy ? autonomy : vehicleFound.autonomy),
                        locked : (locked ? locked : vehicleFound.locked)
                    }).then(function(){
                        done(vehicleFound);
                    }).catch(function(err){
                        return res.status(500).json({'error' : 'vehicle cannot be updated' });
                    });
                } else {
                    return  res.status(404).json({'error' : 'vehicle not found' });
                }
            },
        ],function(vehicleFound){
            if (vehicleFound){
                return  res.status(201).json(vehicleFound);
            } else {
                return res.status(500).json({'error' : 'cannot update vehicle' });
            }
        });

    }
}