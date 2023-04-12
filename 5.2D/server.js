var express = require("express")
const res = require("express/lib/response");
var app = express()

const addTwo = (n1,n2) => {
    return n1+n2
}

app.get('/sum', (req,res) =>{
    const n1 = parseInt(req.query.n1);
    const n2 = parseInt(req.query.n2);
    const result = addTwo(n1,n2);
    res.json({statuscode:200, data:result});
})

console.log(addTwo(5,10));

app.get('/', function(req,res){
    res.send('elo world')
})


app.listen(3000,()=>{
    console.log("Port running");
})

// docker run --name  -p yourport:theirport username/node-web-app
// docket exec -it test1/bin/bash 


//docker compose file 
