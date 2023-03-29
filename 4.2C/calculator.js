const express = require("express");
const res = require("express/lib/response");
const app = express();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const fakeLocal = require("./fakeLocal.json");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy; // for JWT 
const users = require("./users.json"); // to save the users 
const bcrypt = require("bcrypt"); // for hashing the password
const {v4:uuidv4} = require("uuid") // for uuid 
const JwTStrategy = require("passport-jwt").Strategy

const secureRoutes = require('./secureRoutes');


app.set("views", path.join(__dirname,"views")); // login and signup page 
app.set("view engine","ejs"); // ejs view engine 
app.use(bodyParser.urlencoded({extended:false})); // body parser to read the request of body 

app.use(passport.initialize());

app.use("/user", secureRoutes);

function getJwt(){
    console.log("getJWT")
    return fakeLocal.Authorization?.substring(7); //removes the bearer from token 
}

passport.use(
    new JwTStrategy(
        {
            secretOrKey: "TOKEN_KEY", // decoding the data from fakeLocal
            jwtFromRequest: getJwt,
        },
        async (token,done) => {
            console.log("in Jwt Token:",token);

            if(token?.user?.email =="tokenerror"){
                let testError = new Error("Some error is happening because of Tokens");
                return done(testError,false);
            }
            if(token?.user?.email =="emptyToken"){
                Console.log("Empty Token");
                return done(null,false);
            }

            return done(null,token.user); // hardcoding success
        }
    )
);

passport.use( // this is where we verify user details 
    "login",
    new localStrategy(
    {usernameField:"email", passwordField:"password"},
    async(email, password,done)=>
    {
        console.log("login named");
        try{

            if(email==="apperror"){
                throw new Error("Email or password error"); // optional message
            }

            const user = users.find((user)=>user.email===email); // searching in users.json

            if(!user){
                return done(null,false,{message:"User not found"});
            }

            const passwordMatches = await bcrypt.compare(password, user.password); // if password not matching 

            if(!passwordMatches)
            {
                return done(null,false,{message:"Invalid Password"});

            }

            return done(null,user, {message:"Logged in user successfully "});


        }catch(err)
        {
            console.log("here")
            return done(err);// some kind of application error
        }
        
    })
);

passport.use( // signup strategy 
    "signup",
    new localStrategy(
        { usernameField:"email",passwordField:"password"}, // key value pair email password from signup form 
        async(email,password,done)=>{ 
            try{
                if(password.length<=4 || !email){
                    done(null,false,{message:"Email or password error"}); // optional message
                }
                else{ // if everything is valid 
                    const hashedPass = await bcrypt.hash(password,10); // hash the password given to store it 
                    let newUser = {email,password:hashedPass,id: uuidv4()}; // creating new user with the details we got 
                    users.push(newUser); // push into user array in users.json
                    await fs.writeFile("users.json",JSON.stringify(users),(err)=>{
                        if(err) return done(err);
                        console.log("Updated File");
                    }); // using fs file system we are writing the file 
                    return done(null,newUser, {message:"Signed up user successfully "})
                }
            }catch(err)
            {
                return done(err);
            }
        }
    )
)


//Optional Logger winston task 4.1

const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Regualar setup of application 

const add =(n1,n2) =>{
    return n1+n2;
}
const sub =(n1,n2) =>{
    return n1-n2;
}
const multi =(n1,n2) =>{
    return n1*n2;
}
const div =(n1,n2)=>{
    return n1/n2
}


// routes 
app.get("/secureroute", passport.authenticate("jwt",{session:false}), //middleware
    async(req,res)=>
    {
        console.log("Req.isAuthenticated", req.isAuthenticated());
        console.log("Req.User", req.user);
        console.log("Req Login" , req.login);
        console.log("req.logout",req.logout);

        res.send(`thanks for logging in ${req.user.email}`);
    }
);

app.get("/logout",async(req,res)=>{
    // expired invalid or no jwt 
    // to simulate logout we just need to remove data from fakeLocal
    fs.writeFile(
        "fakeLocal.json",
        JSON.stringify({ Authorization: `` }),
        (err) => {
            if (err)
                throw err;
            console.log("Confirm Logout");
        }
    )
    res.redirect("/login")
});

app.get("/login",async(req,res)=>{
    res.render("login")
});

app.get("/signup",async(req,res)=>{
    res.render("signup")
});

app.get("/failed",async(req,res,next)=>{
    res.send(`failed ${req.query?.message}`);
})
app.get("/success",async(req,res,next)=>{
    res.send(`success ${req.query?.message}`);
})

app.post("/login",async(req,res,next)=>{
    passport.authenticate("login",async(err,user,info)=>{
        console.log("error:",err);
        console.log("user:",user)
        console.log("info:",info);
        if(err){
            return next(err.message)
        }
        if(!user){
            res.redirect(`/failed?message=${info.message}`)
        }

        //creating token to add login to fakelocal
        const tempUser= { _id : user.id , email : user.email};

        const token = jwt.sign({user:tempUser}, "TOKEN_KEY");

        if(user){
            fs.writeFile(
                "fakeLocal.json",
                JSON.stringify({ Authorization: `Bearer ${token}` }),
                (err) => {
                    if (err)
                        throw err;
                    console.log("Confirm Login");
                }
            )
            res.redirect(`/success?message=${info.message}`)
        }
    })(req,res,next);
},(req,res,next)=>{
    res.send("hI welcome to your login!");
});

app.post("/signup",async(req,res,next)=>{
    passport.authenticate("signup",async function(err,user,info) { 
        if(err){
            return next(err.message)
        }
        if(!user){
            res.redirect(`/failed?message=${info.message}`)
        }
        // creating web token to add the login in the fakeLocal
        const tempUser= { _id : user.id , email : user.email};

        const token = jwt.sign({user:tempUser}, "TOKEN_KEY");

        fs.writeFile(
            "fakeLocal.json",
            JSON.stringify({ Authorization: `Bearer ${token}` }),
            (err) => {
                if (err)
                    throw err;
                console.log("Updated the localstorage");
            }
        )

        res.redirect(`/success?message=${info.message}`)// just typing this does not log in 
    })(req,res,next);
})


app.get("/add",(req,res) =>{
    try{
        const n1= parseFloat(req.query.n1);
        const n2= parseFloat(req.query.n2);

        if(isNaN(n1) || isNaN(n2))
        {
            logger.error("Error with numbers")
            throw new Error("Not a number");
        }

        const result= add(n1,n2);
        res.status(200).json({statuscode:200, data:result });
    }catch(error){
        console.log(error);
        res.status(500).json({statuscode:500,msg:error.toString()});
    }
});

app.get("/sub",(req,res) =>{
    try{
        const n1= parseFloat(req.query.n1);
        const n2= parseFloat(req.query.n2);

        if(isNaN(n1) || isNaN(n2))
        {
            throw new Error("Not a number");
        }

        const result= sub(n1,n2);
        res.status(200).json({statuscode:200, data:result });
    }catch(error){
        console.log(error);
        res.status(500).json({statuscode:500,msg:error.toString()});
    }
});
app.get("/multiply",(req,res) =>{
    try{
        const n1= parseFloat(req.query.n1);
        const n2= parseFloat(req.query.n2);

        if(isNaN(n1) || isNaN(n2))
        {
            throw new Error("Not a number");
        }

        const result= multi(n1,n2);
        res.status(200).json({statuscode:200, data:result });
    }catch(error){
        console.log(error);
        res.status(500).json({statuscode:500,msg:error.toString()});
    }
});
app.get("/divide",(req,res) =>{
    try{
        const n1= parseFloat(req.query.n1);
        const n2= parseFloat(req.query.n2);

        if(isNaN(n1) || isNaN(n2))
        {
            throw new Error("Not a number");
        }

        const result= div(n1,n2);
        res.status(200).json({statuscode:200, data:result });
    }catch(error){
        console.log(error);
        res.status(500).json({statuscode:500,msg:error.toString()});
    }
});

const port = 3000;
// var a = add(5,8);
// console.log(a);
app.listen(port,()=>{
    console.log(port,"running");
})