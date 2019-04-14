// Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,12}$/;

//Routes
module.exports={
    register: function(req, res){
        // Params
        var email = req.body.email;
        var name = req.body.name;
        var password = req.body.password;
        var bio = req.body.bio;
        var locked = req.body.locked;
        var role = req.body.role;

        if (email == null || name == null || password == null ){
            return res.status(400).json({'error' : 'missing parameters' });
        }

        if (name.length >= 13 || name.length <= 4){
            return res.status(400).json({'error' : 'name must be between 5 and 12 characteres'});
        }

        if (!EMAIL_REGEX.test(email)){
            return res.status(400).json({'error' : 'email is invalid'});
        }

        if (!PASSWORD_REGEX.test(password)){
            return res.status(400).json({'error' : 'password must include at least one number and one letter and must have 4 to 12 characteres'});
        }

        /**
         * vérification que l'utilisateur n'existe pas déjà avant de l'ajouter
         */
        models.users.findOne({
            attributes: ['email'],
            where : { email: email }
        })
        .then(function(userFound) {
            if (!userFound) {
                bcrypt.hash(password, 5, function( err, bcryptedPassword){
                    var newUser = models.users.create({
                        email : email,
                        name : name,
                        password : bcryptedPassword,
                        bio : bio,
                        locked : 0,
                        role : role
                        })
                        .then(function(newUser){
                            return res.status(201).json({
                                'userId': newUser.id
                            })
                        })
                        .catch(function(err){
                            return res.status(500).json({'error' : 'cannot add user' });
                        });
                    });
            } else {
                return res.status(409).json({'error' : 'user already exist' });
            }

        })
        .catch(function(err) {
            return res.status(500).json({'error' : 'unable to verify user' });
        });

    },


    login: function(req,res){

        // Params
        var email=req.body.email;
        var password=req.body.password;

        if (email == null || password == null){
            return res.status(400).json({'error' : 'missing parameters' });
        }

        // TODO verify mail regex & password length

        /**
         * vérification que l'utilisateur existe bien
         */
        models.users.findOne({
            where : { email: email }
        })
        .then(function(userFound) {
            if (userFound){
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt){
                    if(resBycrypt){
                        return res.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        });
                    } else {
                        return  res.status(403).json({'error' : 'invalid password' });
                    }
                });
            } else {
                return  res.status(404).json({'error' : 'user does not exist' });
            }
        })
        .catch(function(err) {
            return res.status(500).json({'error' : 'unable to verify user' });
        });
    },

    getUserProfile: function(req, res){
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0)
            return res.status(400).json({'error' : 'wrong token' });

        //c'est bien le 3...
        //return res.status(400).json({userId});

        models.users.findOne({
            attributes: ['id', 'email', 'name', 'bio'],
            where: { id:userId }
        }).then(function(users){
            if (users){
                return  res.status(201).json(users);
            } else {
                return  res.status(404).json({'error' : 'user not found' });
            }
        }).catch(function(err){
            return res.status(500).json({'error' : 'cannot fetch user' });
        });
    },

    updateUserProfile: function(req, res){
        // Gettinh auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        // Params
        var bio = req.body.bio;

        asyncLib.waterfall([
            function(done){
                models.users.findOne({
                    attributes: ['id','bio'],
                    where: { id:userId }
                }).then(function(userFound){
                    done(null, userFound);
                }).catch(function(err){
                    return res.status(500).json({'error' : 'enable to verify user' });
                });
            },
            function(userFound, done){
                if (userFound){
                    userFound.update({
                        bio : (bio ? bio : userFound.bio)
                    }).then(function(){
                        done(userFound);
                    }).catch(function(err){
                        return res.status(500).json({'error' : 'cannot update user' });
                    });
                } else {
                    return  res.status(404).json({'error' : 'user not found' });
                }
            },
        ],function(userFound){
            if (userFound){
                return  res.status(201).json(userFound);
            } else {
                return res.status(500).json({'error' : 'cannot update user profile' });
            }
        });

    }
}