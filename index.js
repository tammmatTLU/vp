const express = require("express");
const dateTime = require("./my_modules/dateTime");
const fs = require("fs");
//et saada kõik päringust kätte
const bodyparser = require("body-parser");
//andmebaasi andmed
const dbInfo = require("../../vp2024config");
//andmebaasiga suhtlemine
const mysql = require("mysql2");

const app = express();
//määran view mootori (ejs)
app.set("view engine", "ejs");
//määran jagatavate avalike failide kausta
app.use(express.static("public"));
//kasutame body-parserit päringute parsimiseks (kui ainult tekst, siis false, kui ka muud failitüübid, siis true)
app.use(bodyparser.urlencoded({extended: false}));

let notice = "";

//loon andmebaasiühenduse
const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase
});

//Avaleht
app.get("/", (req, res)=>{
    res.render("index", {notice: notice});
});

//Ajainfo
app.get("/timenow", (req, res)=>{
    const dateNow = dateTime.dateFormattedEt();
    const timeNow = dateTime.timeFormattedEt();
    const dayOfWeekNow = dateTime.dayOfWeekEt();
    res.render("timenow", {nowWD: dayOfWeekNow, nowD: dateNow, nowT: timeNow});
});
//Vanasõnade list
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

//Külastuse registreerimine tekstifaili.
app.get("/regvisit", (req, res)=>{
    res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
    //avan tekstifaili selliselt, et kui ei ole olemas, siis luuakse (meetod "a" open funktsioonile.)
    fs.open("public/textfiles/visitlog.txt", "a", (err, file)=>{
        if(err){
            throw err;
        }
        else{
            fs.appendFile("public/textfiles/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + " | " + dateTime.dateFormattedEt() + " | " + dateTime.timeFormattedEt() + ";", (err)=>{
                if(err){
                    notice = "Külastust ei saanud registreerida!"
                    res.render("index", {notice: notice});
                    throw err;
                }
                else{
                    notice = "Külastus registreeriti!"
                    res.render("index", {notice: notice});
                }
            });
        }
    });
});

app.get("/guestlist", (req, res)=>{
    //näitan lehel külastajate listi
    let visitLogTxt = [];
    fs.readFile("public/textfiles/visitlog.txt", "utf8", (err, data)=>{
        if(err){
            notice = "Külastajate loetelu ei saa kuvada!"
            res.render("justlist", {h2: "Registreeritud külastajad:", listData: [], notice: notice});
            throw err;
        }
        else{
            visitLogTxt = data.split(";");
            res.render("justlist", {h2: "Registreeritud külastused:", listData: visitLogTxt, notice: notice});
        }
    });
});

//EESTIFILM

app.get("/eestifilm", (req, res)=>{
    res.render("eestifilm");
});

app.get("/eestifilm/tegelased", (req, res)=>{
    //loon andmebaasi päringu
    let sqlReq = "SELECT first_name, last_name, birth_date FROM person";
    conn.query(sqlReq, (err, sqlRes)=>{
        if(err) {
            res.render("tegelased", {persons: [], h2: "Tegelased:"});
        }
        else {
            res.render("tegelased", {persons: sqlRes, h2: "Tegelased:"});
        }
    });
});
//Filmiandmete lisamine andmebaasi
app.get("/eestifilm/lisa", (req, res)=>{
    let firstName = "";
    let lastName = "";
    let movieTitle = "";
    let productionYear = "";
    let duration = "";
    let movieDesc = "";
    let posName = "";
    let posDesc = "";
    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
});

app.post("/eestifilm/lisa", (req, res)=>{
    let firstName = "";
    let lastName = "";
    let birthDate = "";
    let movieTitle = "";
    let productionYear = "";
    let duration = "";
    let movieDesc = "";
    let posName = "";
    let posDesc = "";
    if(req.body.personSubmit){
        if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput){
            notice = "Osa andmeid on puudu!";
            firstName = req.body.firstNameInput;
            lastName = req.body.lastNameInput;
            birthDate = req.body.birthDateInput;
            res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
        }
        else{
            let sqlReq = "INSERT INTO person (first_name, last_name, birth_date) VALUES (?,?,?)";
            conn.query(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, sqlRes)=>{
                if(err) {
                    notice = "Esines viga!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                    throw err;
                }
                else {
                    notice = "Isik lisati andmebaasi!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                }
            });
        }
    }
    else if(req.body.movieSubmit){
        if(!req.body.movieTitleInput || !req.body.productionYearInput || !req.body.durationInput || !req.body.movieDescInput){
            notice = "Osa andmeid on puudu!";
            movieTitle = req.body.movieTitleInput;
            productionYear = req.body.productionYearInput;
            duration = req.body.durationInput;
            movieDesc = req.body.movieDescInput;
            res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
        }
        else{
            let sqlReq = "INSERT INTO movie (title, production_year, duration, description) VALUES (?,?,?,?)";
            conn.query(sqlReq, [req.body.movieTitleInput, req.body.productionYearInput, req.body.durationInput, req.body.movieDescInput], (err, sqlRes)=>{
                if(err) {
                    notice = "Esines viga!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                    throw err;
                }
                else {
                    notice = "Film lisati andmebaasi!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                }
            });
        }
    }
    else if(req.body.positionSubmit){
        if(!req.body.posNameInput || !req.body.posDescInput){
            notice = "Osa andmeid on puudu!";
            posName = req.body.posNameInput;
            posDesc = req.body.posDescInput;
            res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
        }
        else{
            let sqlReq = "INSERT INTO position (position_name, description) VALUES (?,?)";
            conn.query(sqlReq, [req.body.posNameInput, req.body.posDescInput], (err, sqlRes)=>{
                if(err) {
                    notice = "Esines viga!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                    throw err;
                }
                else {
                    notice = "Amet lisati andmebaasi!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                }
            });
        }
    }
    else {
        notice = "Esines viga!";
        res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
    }
});

//VISITLOG DATABASE
//Külastuse reegistreerimine andmebaasi.
app.get("/regvisitdb", (req, res)=>{
    let firstName = "";
    let lastName = "";
    res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
});

app.post("/regvisitdb", (req, res)=>{
    let firstName = "";
    let lastName = "";
    //kontrollin, et kõik vajalikud andmed oleksid olemas
    if(!req.body.firstNameInput || !req.body.lastNameInput) {
        notice = "Osa andmeid on puudu!";
        firstName = req.body.firstNameInput;
        lastName = req.body.lastNameInput;
        res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
    }
    else {
        let sqlReq = "INSERT INTO visitlog (first_name, last_name) VALUES (?,?)";
        conn.query(sqlReq, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlRes)=>{
            if(err) {
                notice = "Esines viga!";
                res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
                throw err;
            }
            else {
                notice = "Külastus pandi kirja!";
                res.render("index", {notice: notice});
            }
        });
    }
});

app.get("/guestlistdb", (req, res)=>{
    let sqlReq = "SELECT first_name, last_name, visit_date FROM visitlog";
    conn.query(sqlReq, (err, sqlRes)=>{
        if(err) {
            res.render("justlistdb", {h2: "Registreeritud külastajad:", visits: []})
        }
        else {
            res.render("justlistdb", {h2: "Registreeritud külastajad:", visits: sqlRes})
        }
    });
});

app.listen(5249);
