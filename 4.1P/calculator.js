const express = require("express");
const res = require("express/lib/response");
const app = express();

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