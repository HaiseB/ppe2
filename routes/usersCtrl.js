// Imports
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require('../models');

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

        // TODO verify name length, mail regex, password etc...

        /**
         * vérification que l'utilisateur n'éxiste pas déjà avant de l'ajouter
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
        var password =req.body.password;

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
    }
}