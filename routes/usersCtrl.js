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
        var first_name = req.body.first_name;
        var password = req.body.password;
        var bio = req.body.bio;
        var locked = req.body.locked;
        var role = req.body.role;

        /**
         * Vérification des parametres passés
         */

        if (email == null || name == null || first_name == null || password == null ){
            return res.status(400).json({'error' : 'missing parameters' });
        }

        if (name.length >= 13 || name.length <= 4){
            return res.status(400).json({'error' : 'name must be between 5 and 12 characteres'});
        }

        if (!EMAIL_REGEX.test(email)){
            return res.status(400).json({'error' : 'email is invalid'});
        }

        /*
        if (!PASSWORD_REGEX.test(password)){
            return res.status(400).json({'error' : 'password must include at least one number and one letter and must have 4 to 12 characteres'});
        }*/

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
                        first_name : first_name,
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
            where : { name: email }
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

    getMyProfile: function(req, res){
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        if (userId < 0)
            return res.status(400).json({'error' : 'wrong token' });
        models.users.findOne({
            attributes: ['id', 'email', 'name', 'first_name', 'bio'],
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

    updateMyProfile: function(req, res){
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

    },

    listUsers: function(req, res){
        var fields = req.query.fields;
        var order = req.query.order;

        models.users.findAll({
            order: [(order != null) ? order.split(':') : ['name', 'ASC']],
            attributes: (fields !=='*' && fields !=null) ? fields.split(','):null
            }).then(function(users){
                if (users){
                    res.status(200).json(users);
                } else {
                    return res.status(404).json({'error' : 'no users found' });
                }
        }).catch(function(err){
            console.log(err);
            res.status(500).json({'error' : 'invalid fields' });
        });
    },

    getUserById: function(req, res){

        // Params
        var id = req.body.id;

        models.users.findOne({
            where: { id }
            }).then(function(users){
                if (users){
                    res.status(200).json(users);
                } else {
                    return res.status(404).json({'error' : 'no user found'});
                }
        }).catch(function(err){
            console.log(err);
            res.status(500).json({'error' : 'invalid fields' });
        });
    },

    updateUser: function(req, res){
        // Params
        var userId = req.body.id;
        var email = req.body.email;
        var name = req.body.name;
        var first_name = req.body.first_name;
        var password = req.body.password;
        var bio = req.body.bio;
        var locked = req.body.locked;
        var role = req.body.role;


        asyncLib.waterfall([
            function(done){
                models.users.findOne({
                    attributes: ['id','email','name','first_name','password','bio','locked','role'],
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
                        email : (email ? email : userFound.email),
                        name : (name ? name : userFound.name),
                        first_name : (first_name ? first_name : userFound.first_name),
                        password : (password ? password : userFound.password),
                        bio : (bio ? bio : userFound.bio),
                        locked : (locked ? locked : userFound.locked),
                        role : (role ? role : userFound.role)
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