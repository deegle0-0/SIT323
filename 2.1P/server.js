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

var async = function(){
    setTimeout(function(){
        log("I am last exactly 2 seconds late")
    },2000)
}

var adder= function(first,second){
    var sum = first+second
    return sum
}

var log = function(msg){
    console.log("[Log]:" , msg)
}

log("Helo world")
async();
log("Sum:" +adder(5,5))

app.listen(3000)