let {createTransport} = require("nodemailer");
let host = 'smtp.ethereal.email';

/* let user = 'fdx2oen2zxvwy3en@ethereal.email';
let pass = 'vY7UamprESh6JWUeh2H'; */

let user = 'nicolasleonardelli2012@gmail.com';
let pass = 'vaojlkmygjuqwews'; 

let transport = createTransport({
    host,
    service: 'gmail',
    port: 587,
    auth: {
        user,
        pass
    }
});

console.log(process.argv);
let subject =process.argv[2] || `Mi titulo con Nodemailer`;
let html = process.argv[3] || `<div><h2> Hola soy el mensaje</h2></div>`;

(async()=>{
    try{
       

        let params = {
            from: 'Nico',
            to: 'nicolasleonardelli@gmail.com',
            subject,
            html,
            attachments:[
                {

                }
            ]
        }
        const response = await transport.sendMail(params);
        console.log("Response -> ", response);
    }catch(error){
        console.log(error)
    }
})()