const express = require('express')
const Orders = require('../models/Orders')
const {isAuthenticated, hasRoles} = require('../auth')

const router = express.Router()

router.get('/', (req, res) => {
    Orders.find()    //busca todos los elementos dentro de Orders
        .exec()     //ejecuta query 
        .then(x => res.status(200).send(x))       //promesa para devolver
})

router.get('/:id', (req, res) => {
    Orders.findById(req.params.id)
        .exec()
        .then(x => res.status(200).send(x))
})

router.post('/', isAuthenticated,  (req, res) => {
    const {_id} = req.user  //en lugar de recibir usuario lo asignamos del lado del servidor
    Orders.create({...req.body, user_id: _id})  //id sacado de req.user
        .then(x => res.status(201).send(x))
})

router.put('/:id', isAuthenticated, /*hasRoles(['admin', 'user']),*/ (req, res) => {    //con lo comentado indicas q usuarios pueden acceder a la ruta
    Orders.findOneAndUpdate(req.params.id, req.body)
        .then(() => res.sendStatus(204))
})

router.delete('/:id', isAuthenticated, (req, res) => {
    Orders.findOneAndDelete(req.params.id)
        .then(() => res.sendStatus(204))
})

module.exports = router