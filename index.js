const express = require("express");
const dateTime = require("./dateTime");
const fs = require("fs")


const app = express();
//määran view mootori (ejs)
app.set("view engine", "ejs");
//määran jagatavate avalike failide kausta
app.use(express.static("public"));

app.get("/", (req,res)=>{
    //res.send("Express läks käima!");
    res.render("index");
});

app.get("/timenow", (req,res)=>{
    const dateNow = dateTime.dateFormattedEt();
    const timeNow = dateTime.timeFormattedEt();
    const dayOfWeekNow = dateTime.dayOfWeekEt();
    res.render("timenow", {nowWD: dayOfWeekNow, nowD: dateNow, nowT: timeNow});
});

app.get("/vanasonad", (req,res)=>{
    let folkWisdom = [];
    fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data)=>{
        if(err){
            res.render("justlist", {h2: "Vanasõnu ei ole", listData: []});
        }
        else{
            folkWisdom = data.split(";");
            res.render("justlist", {h2: "Vanasõnad", listData: folkWisdom});
        }
    });
});

app.listen(5209);