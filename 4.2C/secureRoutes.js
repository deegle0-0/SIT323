const express= require("express");
const passport = require("passport");
const router = express.Router();

router.all("*", function(req,res,next){
    passport.authenticate("jwt",{session:false}, function(err,user,info){
        console.log("Router error:",err);
        console.log("Router user: ",user);
        console.log("Router info: ",info?.message);

        if(info)
        {
            console.log("Invalid token or token not present ");
            return res.send(info.message);
        }

        if(err){
            console.log("There is a token error");
            return res.send(err.message);
        }
        
        if(!user){
            return res.send("Weird error");
        }

        if(user){
            console.log("Req.login?",req.login);
            req.isAuthenticated = true;
            req.user= user;
            return next();

        }
    })(req,res,next);
});

router.get("/profile",(req,res,next)=>{
    console.log("isAuthenticated: ", req.isAuthenticated)

    console.log("Req user",req.user)
    console.log("req login: ",req.login);
    console.log("req logout:",req.logout);
    res.json({
        user:req.user,
        message:"hello",
    });
});

router.get("/settings",(req,res,next)=>
{
    res.json({
        user:req.user,
        message:"SettingsPage",
    });
});

module.exports=router;