// Imports
var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET ='j1a2i3m4e5l6a7s8e9c1u2r3i4t5e6';

// Exported functions
module.exports = {
    generateTokenForUser: function(userData) {
        return jwt.sign({
            userId: userData.id,
            role: userData.role
        },
        JWT_SIGN_SECRET,
        {
            expiresIn: '1h'
        })
    }
}