const express = require("express");
const res = require("express/lib/response");
const expressSession = require('express-session'); 
const SECRET_KEY_SESION = "clase18135";
let path = require("path");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;

 const FACEBOOK_APP_ID = "365759142043743";
let FACEBOOK_APP_SECRET = "371679bb7714bfafb5956dc8aa343d68";




let users = [];


const app = express();
const PORT = 3001;

app.use(express.static("public"));

app.use(express.json());                    
app.use(express.urlencoded({extended:true}));

app.set("views", path.resolve(__dirname,"views"));
app.set("view engine", "ejs");

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: 'auth/facebook/callback'
},function(accessToken, refreshToken, profile,done){
    User.findOrCreate(profile.id, function(err,user){
        done(null,user)
    });
}
));

/* passport.use("register", new LocalPassport(
    {passReqToCallback:true},
    (req,username,password,done)=>{
    
        let {direccion} = req.body;
    let user = users.find(usuario=>usuario.username == username);
    if(user) return done(null,false);

        let newUser = {
        username,
        password,
        direccion
    };
    users.push(newUser);
    return done(null,false);
}));

passport.serializeUser((user,done)=>{
    done(null, user.username);
})

passport.deserializeUser((username,done)=>{
    let user = users.find(usuario=>usuario.username == username);
    done(null,user)
}) */

app.use(expressSession({
    secret: SECRET_KEY_SESION,
    cookie:{
        httpOnly: false,
        secure: false,
        maxAge:60000
    },
    resave: false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());


let isAuth = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.render('error', {eror: "No estas autenticado"});
    }
} 

let isNoAuth = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        res.redirect('datos');
    }
} 

app.get("/",(req,res,next)=>{
    res.render("login",{});
})


app.get('/auth/facebook',passport.authenticate('facebook'));


app.get("/auth/facebook/callback", 
passport.authenticate('facebook',{successRedirect: '/',
                                failureRedirect: '/login'}));



app.get("/error", isNoAuth,(req,res,next)=>{
    res.render("error", {error: "un mensaje de error"});

})
        // PASSPORT

/* app.post("/login", passport.authenticate("login",{successRedirect:"datos", failureRedirect: "error"}));
    


app.post("/registro",  passport.authenticate("register",{successRedirect:"datos", failureRedirect: "error"}));
     */

app.get("/datos",(req,res,next)=>{
    console.log(req.user)
    res.render("datos", {usuario: req.user});
})


app.get("/logout",(req,res,next)=>{
    req.session.destroy(err =>{
        if(err) res.send(JSON.stringify(err));
        res.redirect("/");
    })
})


app.listen(PORT,err=>{
    console.log(`http://localhost:${PORT}`);
})