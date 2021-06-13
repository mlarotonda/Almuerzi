const express = require('express')      //libreria para crear app
const mongoose = require('mongoose')    //conectarse a mongoDB + driver
const bodyParser = require('body-parser')   //transformar peticiones a JSON
const cors = require('cors')    //habilitar peticion en urls distintas

const meals = require('./routes/meals')
const orders = require('./routes/orders')
const auth = require('./routes/auth')

const app = express()
app.use(bodyParser.json())   //app.use agrega plugin para agregar funcionalidades
app.use(cors())            

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })     //conectarse a servidor de BD
//								variable de entorno     		interpretar url          

app.use('/api/meals', meals)
app.use('/api/orders', orders)
app.use('/api/auth', auth)

module.exports = app