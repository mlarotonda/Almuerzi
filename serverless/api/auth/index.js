//middleware
const jwt = require('jsonwebtoken')
const Users = require('../models/Users')

const isAuthenticated = (req, res, next) => {  
    const token = req.headers.authorization
    if(!token){
        return res.sendStatus(403)
    }
    jwt.verify(token, 'mi-secreto', (err, decoded) => {
        const { _id } = decoded
        Users.findOne({ _id }).exec()
            .then(user => {     //cuando traemos el usuario, modificamos el obj de req y llamos a next para el siguiente middleware
                req.user = user
                next()
            })
    })
}

const hasRoles = roles => (req, res, next) => {
    if (roles.indexOf(req.user.role) > -1){     //rol del usuario se encuentra dentro de los elementos del arreglo
        return next()
    }
    res.sendStatus(403)
}

module.exports = {
    isAuthenticated,
    hasRoles,
}