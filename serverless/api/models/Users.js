const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Users = mongoose.model('User', new Schema({
    email: String,
    password: String,
    salt: String,    //string para encriptar contraseña
    role: {type: String, default: 'user'} //autorizacion: admin
}))

module.exports = Users