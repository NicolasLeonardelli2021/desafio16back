let {mongoose} = require("../config/mongoDB")

let {Schema, model} = mongoose;

const usuarioCollection = 'Usuarios'

const usuarioSchema = new mongoose.Schema({
        email:{type:String},
        name:{type:String},
        imagen:{type:String},
        password:{type:String}
    
})

//let mensajeSchemaModel = new Schema(mensajeSchema)
//let mensajeModel = new model('mensajes', mensajeSchemaModel)

module.exports = mongoose.model(usuarioCollection, usuarioSchema)