const express = require("express");
const dateTime = require("./dateTime");
const fs = require("fs")
//et saada kõik päringust kätte
const bodyparser = require("body-parser")

const app = express();
//määran view mootori (ejs)
app.set("view engine", "ejs");
//määran jagatavate avalike failide kausta
app.use(express.static("public"));
//kasutame body-parserit päringute parsimiseks (kui ainult tekst, siis false, kui ka muud failitüübid, siis true)
app.use(bodyparser.urlencoded({extended: false}));

app.get("/", (req, res)=>{
    res.render("index");
});
app.get("/timenow", (req, res)=>{
    const dateNow = dateTime.dateFormattedEt();
    const timeNow = dateTime.timeFormattedEt();
    const dayOfWeekNow = dateTime.dayOfWeekEt();
    res.render("timenow", {nowWD: dayOfWeekNow, nowD: dateNow, nowT: timeNow});
});
app.get("/vanasonad", (req, res)=>{
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

app.get("/regvisit", (req, res)=>{
    res.render("regvisit")
});

app.post("/regvisit", (req, res)=>{
    //avan tekstifaili selliselt, et kui ei ole olemas, siis luuakse (meetod "a" open funktsioonile.)
    fs.open("public/textfiles/visitlog.txt", "a", (err, file)=>{
        if(err){
            throw err;
        }
        else{
            fs.appendFile("public/textfiles/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ";", (err)=>{
                if(err){
                    throw err;
                }
                else{
                    console.log("Faili kirjutati!")
                    res.render("index")
                }
            });
        }
    });
    //res.render("regvisit");
});
app.listen(5209);

//KODUS:
//1) Lisada logile aeg, millal keegi külastas.
//2) Näidata lehel listi nimedest ja kellaaegadest.