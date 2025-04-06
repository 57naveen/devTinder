const express = require("express");

const app = express();

app.use("/",(req,res)=>{
        res.send("Hellow buddy...")
})

app.listen(5555,()=>{
    console.log("Server is running in the port 5555")
})