const express = require("express")
const app = express()
let {config,mongo_db,facebook} = require("./config");
let controller = require("./components/controllers/controller")
let moment = require("moment")
const router = express.Router();
let cors = require("cors")
let path = require('path')
let {Server: HttpServer} = require('http')
let {Server:SocketIO} = require('socket.io');
const cookieParser = require("cookie-parser")
const session = require("express-session")
let mensajeModel = require("./DB/mongoose")
let usuarios = require("./DB/usuarios")
const MongoStore = require('connect-mongo');
const passport = require("passport");
const { render } = require("express/lib/response");
const FacebookStrategy = require("passport-facebook").Strategy;
const {port,modoServer} = require("./config/puerto");
const numCPUs = require('os').cpus().length
let input_data = process.argv.slice(2);
let {fork} = require("child_process");
//let hijo = fork('./child_process.js')
let cluster = require("cluster");
let responseTime = require("response-time")
let gzip = require("compression")
const winston = require("./utils/loggers/winston")

const advancedOptions = {useNewUrlParser:true,useUnifiedTopology:true}

app.use(express.static("public"));

app.use(cors("*"));

app.use(responseTime());
app.use(gzip());

app.use(express.json());                    
app.use(express.urlencoded({extended:true}));

app.set("views", path.join(__dirname,"./views"));
app.set("view engine", "ejs");

app.use(cookieParser())

 app.use(session({
    //store: new File_store({path: "./sesiones", ttl:300,retries:0}),
    store: MongoStore.create({
        mongoUrl: mongo_db.uri,
        mongoOptions: advancedOptions
    }),

    secret: "secret",
    resave: true,
    saveUninitialized:true,
      cookie:{
        maxAge:60000
    }   

})); 

passport.use(new FacebookStrategy({
    clientID: facebook.app_id,
    clientSecret: facebook.app_secret,
    callbackURL: '/auth/facebook/callback'
},/* function(accessToken, refreshToken, profile,done){
    User.findOrCreate(profile.id, function(err,user){
        done(null,user)
    }); */
//}
 (token, tokensecret, profile,done)=>{
     console.log(profile.displayName)
    done(null,profile);
} 
));

passport.serializeUser((user,done)=>{
    done(null, user);
})

passport.deserializeUser((obj,done)=>{
    done(null,obj)
})

app.use(passport.initialize());
app.use(passport.session());


let isAuth = (req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/')
} 

let isNoAuth = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        res.redirect('/login');
    }
} 



// ----------Socket-----------------
let http = new HttpServer(app);
let io = new SocketIO(http);

      
// Nueva coneccion
io.on("connection", socket =>{
    winston.info("Nuevo cliente conectado:", socket.id)
    leerBase();
   
    socket.on("nuevoChat",data =>{
        datos={
            ...data,
            hora: moment().format("YYYY-MM-DD HH:mm:ss")
            }
            const mensajeSavemodel =new mensajeModel(datos);
            let mensajeSave = mensajeSavemodel.save()
      
                .then(()=>console.log("mensaje insertado"))
                .catch((err)=> {winston.error("error al insertar el mensaje",err)})

        io.sockets.emit("mensaje",datos)
       
    })
    async function leerBase(){
        try{ 
            let mensajes =  await mensajeModel.find({})
            .then((data)=> socket.emit("iniciarChat",data));
            //.then((data)=>console.log(data));
            
       }catch(error){
        winston.error("No se puede leer la base de datos",error)
       }
    }
})


    


// -------API REST ------------

app.get('/auth/facebook',passport.authenticate('facebook'));


app.get("/auth/facebook/callback", 
passport.authenticate('facebook',{successRedirect: '/login',
                                failureRedirect: '/'}));




app.get("/", gzip(), (req,res,next) =>{
    winston.info(" get /")
    const user = getName(req);

    if(user == undefined){       
        res.redirect("login.html");
    }else{
        controller.test()
        .then(array => res.render("",{user,array}))
        .catch(error => console.log(error))
    }    
})



app.get("/login",isAuth,gzip(),(req,res,next)=>{
    winston.info(" get /login")
    let user = "";
    const email = "";
    const imagen = "";
    const userIngreso = getName(req);
    const userFacebook = req.user.displayName;
    if(userIngreso == undefined && userFacebook == undefined){
        res.redirect("login.html"); 

    }else if(userFacebook == undefined && userIngreso != undefined ){
        user = userIngreso
        
    }else{
        user = userFacebook
       
        controller.test()
        .then(array => res.render("",{user,array,email,imagen}))
        .catch(error => console.log(error));
    }
})

const getName = req =>req.session.name;

app.post("/login", async (req,res,next)=>{
    winston.info(" post /login")
    let {name} = req.body;
    let {password} = req.body;

    if(name != "" && password !=""){
        let usuario = await usuarios.find({name:name,password:password})
        console.log(usuario)
        if(usuario==""){
            res.redirect("error.html");
        }else{
        const email = usuario[0].email;
        const imagen = usuario[0].imagen 
         req.session.name = name;
        const user = getName(req)
        controller.test()
        .then(array => res.render("index",{user,array,email,imagen}))
        .catch(error => console.log(error))
        } 
    }else{
        res.redirect("error.html");
    }
    
})

app.get("/olvidar",gzip(), (req, res, next)=>{
    winston.info(" get /olvidar")
    let name = getName(req)
    req.session.destroy(err =>{
        if(err) res.json({error: JSON.stringify(err) });
        res.render("logout", {name});      
    })
    
})

app.get("/registro", gzip(), (req,res,next)=>{
    winston.info(" get /registro")
    res.render('registro',{})
})
app.post("/registro",(req, res,next)=>{
    winston.info(" post /registro")
    const usuarioSave =new usuarios(req.body);
    usuarioSave.save();
    res.redirect("login.html");
})

app.get("/info", gzip(), (req,res,next)=>{
    winston.info(" get /info")
    const memoria =  process.memoryUsage()
    const  memoUsada = memoria.rss
    datos={
        entrada: input_data,
        SO: process.platform,
        versionNode: process.version,
        memoriaUsada: memoUsada,
        ejecutable: process.execPath,
        processId: process.pid,
        carpetaProy: process.cwd(),
        numeroCPU: numCPUs

    }

    res.render("info",{datos});
})


app.get("/infoBloq", gzip(), (req,res,next)=>{
    winston.info(" get /infoBloq")
    const memoria =  process.memoryUsage()
    const  memoUsada = memoria.rss
    datos={
        entrada: input_data,
        SO: process.platform,
        versionNode: process.version,
        memoriaUsada: memoUsada,
        ejecutable: process.execPath,
        processId: process.pid,
        carpetaProy: process.cwd(),
        numeroCPU: numCPUs

    }
    console.log("datos")
    res.render("info",{datos});
})




app.get("/api/randoms", gzip(),(req,res,next)=>{
    winston.info(" get /api/randoms")
    let {cant} = req.query

    if(cant == undefined){
        cant = 100000000
    }
    //const objeto = random(cant);
    hijo.send(cant)
    hijo.on("message", data => {
        res.send(data)
    })
     
})

router.all("*", function(req,res,next){
    winston.warn(`GET ${req.path}`);
    res.send("La ruta no existe");
})

app.use(router);

if(modoServer == "CLUSTER"){
if(cluster.isMaster){
    console.log(`Master PID -> ${process.pid}`)

    //WORKES    
    
    for(let i = 0; i< numCPUs; i++){
        cluster.fork();
        
    }
    
   /*  cluster.on('exit',(worker,code,signal)=>{
        console.log(`Murio el subproceso" ${worker.process.pid}`);
    }) */
}else{

http.listen(port, ()=>{
   // app.listen(PORT, ()=>{
    console.log(`estamos escuchando en esta url: http://localhost:${port} || Worker: ${process.pid}`)
})
}
}else{
    http.listen(port, ()=>{
        // app.listen(PORT, ()=>{
         console.log(`estamos escuchando en esta url: http://localhost:${port} || Worker: ${process.pid}`)
})
}