const express = require("express");
const dateTime = require("./my_modules/dateTime");
const general = require("./my_modules/generalFnc");
const fs = require("fs");
//et saada kõik päringust kätte
const bodyparser = require("body-parser");
//andmebaasi andmed
const dbInfo = require("../../vp2024config");
//andmebaasiga suhtlemine
const mysql = require("mysql2");
//fotode üleslaadimiseks
const multer = require("multer");
//Pilditöötluseks
const sharp = require("sharp");
//Paroolide krüpteerimiseks
const bcrypt = require("bcrypt");
//sessioonihaldur
const session = require("express-session");
//asünkroonsuse võimaldaja
const asyn = require("async");

const app = express();
//määran view mootori (ejs)
app.set("view engine", "ejs");
//määran jagatavate avalike failide kausta
app.use(express.static("public"));
//kasutame body-parserit päringute parsimiseks (kui ainult tekst, siis false, kui ka muud failitüübid, siis true)
app.use(bodyparser.urlencoded({extended: true}));
//seadistame fotode üleslaadimiseks vahevara (middleware), mis määrab kataloogi, kuhu laetakse
const upload = multer({dest: "./public/gallery/orig"});
//sessioonihaldur
app.use(session({secret:"Salavõti", saveUninitialized: true, resave: true}))
//let mySession;

//loon andmebaasiühenduse
const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase
});

//uudiste osa eraldi ruuteriga
const newsRouter = require("./routes/newsRouter");
app.use("/news", newsRouter);

//eestifilmi osa eraldi ruuteriga
const estFilmRouter = require("./routes/estFilmRouter");
app.use("/eestifilm", estFilmRouter);

//VILJAVEDU osa eraldi ruuteriga
const viljaveduRouter = require("./routes/viljaveduRouter");
app.use("/viljavedu", viljaveduRouter);

//gallerii osa eraldi ruuteriga
const galleryRouter = require("./routes/galleryRouter");
app.use("/gallery", galleryRouter);

//ilmateate osa eraldi ruuteriga
const weatherRouter = require("./routes/weatherRouter");
app.use("/weather", weatherRouter);

let notice = "";

//Avaleht
app.get("/", (req, res)=>{
    const myQueries = [
        function(callback){
            conn.execute("SELECT id, file_name, alt_text FROM vp_photos WHERE privacy = 3 AND deleted IS NULL ORDER BY added DESC", (err, result)=>{
                if(err) {
                    return callback(err);
                }
                else {
                    return callback(null, result);
                }
            });
        }
    ];
    //paneme need tegevused paralleelselt tööle. tulemuse saab siis kui kõik tehtud. tulemuseks üks koondlist.
    asyn.parallel(myQueries, (err, results)=>{
        if(err){
            console.log(err);
            res.render("index");
        }
        else{
            console.log(results[0][0]);
            res.render("index", {
                id: results[0][0].id,
                href: "/gallery/thumb/", 
                filename: results[0][0].file_name, 
                alt: results[0][0].alt_text
            });
        }
    });
});

//Sisse logimine
app.post("/", (req, res)=>{
    if(!req.body.emailInput || !req.body.passwordInput){
        console.log("Andmed pole täielikud")
        notice = "Andmed pole täielikud!"
        res.render("index", {notice: notice});
    }
    else{
        let sqlReq = "SELECT id, password FROM vp_users WHERE email = ?";
        conn.execute(sqlReq, [req.body.emailInput], (err,result)=>{
            if(err){
                console.log("Ei saanud parooli kätte");
                console.log(err);
                notice = "Katki";
                res.render("index", {notice: notice});
            }
            else{
                if(result[0] != null){
                    //kontrollime räsi vastavust sisestatud paroolile.
                    bcrypt.compare(req.body.passwordInput, result[0].password, (err,compareResult)=>{
                        if(err){
                            console.log("Parool ja räsi ei ühti");
                            console.log(err);
                            notice = "Katki";
                            res.render("index", {notice: notice});
                        }
                        else{
                            //Kui võrdlustulemus on positiivne
                            if(compareResult){
                                console.log("Töötab.");
                                req.session.userId = result[0].id;
                                res.redirect("/home");
                            }
                            else{
                                console.log("")
                                notice = "Kasutajatunnus ja/või parool oli vigane!";
                                res.render("index", {notice:notice});
                            }
                        }
                    });
                }
                else{
                    console.log("kasutajat pole")
                    notice = "Kasutajatunnus või parool oli vigane!";
                    res.render("index", {notice:notice})
                }
            }
        });
    }
});

app.get("/home", general.checkLogin,(req, res)=>{
    res.render("home");
});

app.get("/logout", (req, res)=>{
    req.session.destroy();
    res.redirect("/");
})

//Kasutajakonto loomine
app.get("/signup", (req, res)=>{
    firstName = ""
    lastName = ""
    gender = 0
    birthDate = ""
    email = ""
    res.render("signup", {notice:notice, firstName:firstName, lastName:lastName, gender:gender, birthDate:birthDate, email:email});
});

app.post("/signup", (req, res)=>{
    let firstName = req.body.firstNameInput
    let lastName = req.body.lastNameInput
    let gender = req.body.genderInput
    let birthDate = req.body.birthDateInput
    let email = req.body.emailInput
    let emailReq = "SELECT id FROM vp_users WHERE email = ?"
    conn.execute(emailReq, [req.body.emailInput], (err, emailRes)=>{
        if(err){
            notice = "Tehniline viga 1.";
            console.log(err);
            res.render("signup", {notice:notice, firstName:firstName, lastName:lastName, gender:gender, birthDate:birthDate, email:email});
        }
        else{
            if(emailRes[0] != null){
                notice = "Emaili aadress on juba registreeritud!";
                res.render("signup", {notice:notice, firstName:firstName, lastName:lastName, gender:gender, birthDate:birthDate, email:email});
            }
            else if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.genderInput || !req.body.birthDateInput || !req.body.emailInput || !req.body.passwordInput || !req.body.confirmPasswordInput){
                console.log("Andmeid puudu");
                notice = "Andmeid on puudu.";
                res.render("signup", {notice:notice, firstName:firstName, lastName:lastName, gender:gender, birthDate:birthDate, email:email});
            }
            else if(req.body.passwordInput < 8 || req.body.passwordInput !== req.body.confirmPasswordInput){
                console.log("Paroolid ei klapi.");
                notice = "Paroolid ei klapi.";
                res.render("signup", {notice:notice, firstName:firstName, lastName:lastName, gender:gender, birthDate:birthDate, email:email});
            }
            else{
                notice = "Töötas.";
                bcrypt.genSalt(10, (err, salt)=>{
                    if(err){
                        console.log("Soola error");
                        notice = "Tehniline viga, kasutajat ei loodud!";
                        res.render("signup", {notice:notice, firstName:firstName, lastName:lastName, gender:gender, birthDate:birthDate, email:email});
                    }
                    else{
                        bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash)=>{
                            if(err){
                                console.log("Räsi error");
                                notice = "Tehniline viga, kasutajat ei loodud!";
                                res.render("signup", {notice:notice, firstName:firstName, lastName:lastName, gender:gender, birthDate:birthDate, email:email});
                            }
                            else{
                                let sqlReq = "INSERT INTO vp_users (first_name, last_name, gender, birth_date, email, password) VALUES (?,?,?,?,?,?)";
                                conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.genderInput, req.body.birthDateInput, req.body.emailInput, pwdHash], (err,sqlRes)=>{
                                    if(err){
                                        console.log("Andmebaasi kirjutamise viga");
                                        notice = "Tehniline viga, kasutajat ei loodud!";
                                        res.render("signup", {notice:notice, firstName:firstName, lastName:lastName, gender:gender, birthDate:birthDate, email:email});
                                    }
                                    else{
                                        console.log("Kasutaja loodi nimega " + req.body.emailInput);
                                        notice = "Kasutaja "+ req.body.emailInput +" loodi!";
                                        res.render("index", {notice:notice});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
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
    if(!req.body.firstNameInput || !req.body.lastNameInput){
        notice = "Osa andmeid on puudu!";
        firstName = req.body.firstNameInput;
        lastName = req.body.lastNameInput;
        res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
    }
    else{
        let sqlReq = "INSERT INTO visitlog (first_name, last_name) VALUES (?,?)";
        conn.query(sqlReq, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlRes)=>{
            if(err){
                notice = "Esines viga!";
                res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
                throw err;
            }
            else{
                notice = "Külastus pandi kirja!";
                res.render("index", {notice: notice});
            }
        });
    }
});

app.get("/guestlistdb", (req, res)=>{
    let sqlReq = "SELECT first_name, last_name, visit_date FROM visitlog";
    conn.query(sqlReq, (err, sqlRes)=>{
        if(err){
            res.render("justlistdb", {h2: "Registreeritud külastajad:", visits: []});
        }
        else{
            res.render("justlistdb", {h2: "Registreeritud külastajad:", visits: sqlRes});
        }
    });
});

//GALLERY
app.get("/photoupload", general.checkLogin, (req, res)=>{
    res.render("photoupload");
});

app.post("/photoupload", upload.single("photoInput"), (req, res)=>{
    const fileName = "vp_" + Date.now() + ".jpg";
    fs.rename(req.file.path, req.file.destination + "/" + fileName, (err)=>{
        if(err){
            console.log("Faili nime muutmise viga: " + err);
        }
    });
    sharp(req.file.destination + "/" + fileName).resize(800, 600).jpeg({quality: 90}).toFile("./public/gallery/normal/" + fileName);
    sharp(req.file.destination + "/" + fileName).resize(100, 100).jpeg({quality: 90}).toFile("./public/gallery/thumb/" + fileName);
    //salvestame info andmebaasi
    let sqlReq = "INSERT INTO vp_photos (file_name, orig_name, alt_text, privacy, userid) VALUES (?,?,?,?,?)";
    conn.execute(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, req.session.userId], (err, sqlRes)=>{
        if(err){
            throw err;
        }
        else{
            console.log("Pilt laeti andmebaasi!");
            res.render("photoupload");
        }
    });
});

app.listen(5209);
