// Imports
var models = require('../models');
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');

// Constants
const TITLE_LIMIT=2;
const CONTENT_LIMIT=8;
const ITEMS_LIMIT   = 50;

// Routes
module.exports = {
    createMessage: function(req, res){
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        // Params
        var title = req.body.title;
        var content = req.body.content;

        if (title == null || content == null){
            return res.status(400).json({'error' : 'missing parameters' });
        }

        if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT){
            return res.status(400).json({'error' : 'invalid parameters' });
        }

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
                    models.messages.create({
                        title : title,
                        content : content,
                        likes : 0,
                        read : 0,
                        userId : userFound.id
                    })
                    .then(function(newMessage){
                        done(newMessage);
                    });
                } else {
                    return res.status(400).json({'error' : 'user not found' });
                }
            },
        ], function(newMessage){
            if (newMessage){
                return res.status(201).json(newMessage);
            } else {
                return res.status(400).json({'error' : 'cannot post message' });
            }
        });
    },

    listMessages: function(req, res){
        var fields = req.query.fields;
        var limit = parseInt(req.query.limit);
        var offset = parseInt(req.query.offset);
        var order = req.query.order;

        if (limit > ITEMS_LIMIT) {
            limit = ITEMS_LIMIT;
        }

        models.messages.findAll({
            order: [(order != null) ? order.split(':') : ['title', 'ASC']],
            attributes: (fields !=='*' && fields !=null) ? fields.split(','):null,
            limit: (!isNaN(limit)) ? limit : null,
            offset: (!isNaN(offset)) ? offset : null,
            include: [{
                model: models.users,
                attributes: [ 'name' ]
            }]
            }).then(function(messages){
                if (messages){
                    res.status(200).json(messages);
                } else {
                    return res.status(404).json({'error' : 'no message found' });
                }
        }).catch(function(err){
            console.log(err);
            res.status(500).json({'error' : 'invalid fields' });
        });
    },

    messageConsulted: function(req, res){
        // Params
        var id = req.body.id;

        asyncLib.waterfall([
            function(done){
                models.messages.findOne({
                    attributes: ['id'],
                    where: { id }
                }).then(function(messageFound){
                    done(null, messageFound);
                }).catch(function(err){
                    return res.status(500).json({'error' : 'enable to verify message' });
                });
            },
            function(messageFound, done){
                if (messageFound){
                    messageFound.update({
                        read : 1
                    }).then(function(){
                        done(messageFound);
                    }).catch(function(err){
                        return res.status(500).json({'error' : 'cannot update message' });
                    });
                } else {
                    return  res.status(404).json({'error' : 'message not found' });
                }
            },
        ],function(messageFound){
            if (messageFound){
                return  res.status(201).json(messageFound);
            } else {
                return res.status(500).json({'error' : 'cannot update message' });
            }
        });
    }
}