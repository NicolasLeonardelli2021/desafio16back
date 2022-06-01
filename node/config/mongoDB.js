const mongoose = require("mongoose");
const winston = require("./../utils/loggers/winston");

const {mongo_db} = require("./");

//const MONGO_URI = `${mongo_db.uri}/${mongo_db.name}`
const MONGO_ATLAS = `${mongo_db.mongo_atlas}`

let connection;
(async ()=>{
    try{
        connection = await mongoose.connect(MONGO_ATLAS, {useNewUrlParser:true,useUnifiedTopology:true});
        console.log("coneccion establecida!");
    }catch(error){
        winston.error("Error al conectar con la base de datos")
    }
})()

module.exports = {connection,mongoose}