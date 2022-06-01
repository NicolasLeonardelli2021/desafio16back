
let procArgv = require("yargs")(process.argv.slice(2));

let options = {
    alias:{
        _: 'otros'
    }
}

let option = {
    default:{
        port: '8080'
    }
}

const response = procArgv.alias(options.alias).argv;
const response2 = procArgv.default(option.default).argv
response.otros = response._;

let port = 0;

if(response.otros[0]==undefined){
    port = response2.port
}else{
    port = response.otros[0]
}


let modoServer = response.otros[1];

if(modoServer != "FORK" && modoServer != "CLUSTER") modoServer = "FORK";

module.exports = {port,modoServer}