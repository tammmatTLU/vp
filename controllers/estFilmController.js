const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
//asünkroonsuse võimaldaja
const asyn = require("async");

const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase
});

//@desc home page for eestifilm section
//@route GET /api/eestifilm
//@access private

const estFilmHome = (req, res)=>{
    res.render("eestifilm");
};

//@desc page for viewing people in eestifilm database
//@route GET /api/eestifilm
//@access private

const estFilmPeople = (req, res)=>{
    //loon andmebaasi päringu
    let sqlReq = "SELECT id, first_name, last_name, birth_date FROM person";
    conn.query(sqlReq, (err, sqlRes)=>{
        if(err){
            res.render("tegelased", {persons: []});
        }
        else{
            res.render("tegelased", {persons: sqlRes});
        }
    });
};

//@desc page for viewing people's connections to movies in eestifilm database
//@route GET /api/eestifilm
//@access private

const estFilmRelations = (req, res)=>{
    console.log(req.params.id);
    let sqlReq = "SELECT person_in_movie.role, movie.title, movie.production_year, position.position_name FROM movie JOIN person_in_movie ON person_in_movie.movie_id = movie.id JOIN if24_mattias_ta.position ON person_in_movie.position_id = position.id JOIN person ON person.id = person_in_movie.person_id WHERE person.id = ?"
    conn.execute(sqlReq, [req.params.id], (err, sqlRes)=>{
        if(err){
            throw err;
        }
        else{
            console.log(sqlRes);
            res.render("personrelations", {relationList: sqlRes});
        }
    });
};

//@desc page for adding people, movies and positions into the eestifilm database
//@route GET /api/eestifilm
//@access private

const estFilmAddData = (req, res)=>{
    let firstName = "";
    let lastName = "";
    let movieTitle = "";
    let productionYear = "";
    let duration = "";
    let movieDesc = "";
    let posName = "";
    let posDesc = "";
    notice = "";
    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
};

//@desc adding people, movies and positions into the eestifilm database
//@route GET /api/eestifilm
//@access private

const estFilmAddingData = (req, res)=>{
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
                if(err){
                    notice = "Esines viga!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                    throw err;
                }
                else{
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
                if(err){
                    notice = "Esines viga!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                    throw err;
                }
                else{
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
            let sqlReq = "INSERT INTO if24_mattias_ta.position (position_name, description) VALUES (?,?)";
            conn.query(sqlReq, [req.body.posNameInput, req.body.posDescInput], (err, sqlRes)=>{
                if(err){
                    notice = "Esines viga!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                    throw err;
                }
                else{
                    notice = "Amet lisati andmebaasi!";
                    res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
                }
            });
        }
    }
    else{
        notice = "Esines viga!";
        res.render("addData", {notice: notice, firstName: firstName, lastName: lastName, movieTitle: movieTitle, productionYear: productionYear, duration: duration, movieDesc: movieDesc, posName: posName, posDesc: posDesc});
    }
};

//@desc page for adding relations between people, movies and positions into the eestifilm database
//@route GET /api/eestifilm
//@access private

const estFilmAddRelations = (req, res)=>{
    //kasutades async moodulit, panen mitu andmebaasi päringut samaaegselt toimima.
    //loon SQL päringute loendi
    const myQueries = [
        function(callback){
            conn.execute("SELECT id, first_name, last_name, birth_date FROM person", (err, result)=>{
                if(err) {
                    return callback(err);
                }
                else {
                    return callback(null, result);
                }
            });
        },
        function(callback){
            conn.execute("SELECT id, title, production_year FROM movie", (err, result)=>{
                if(err) {
                    return callback(err);
                }
                else {
                    return callback(null, result);
                }
            });
        },
        function(callback){
            conn.execute("SELECT id, position_name FROM if24_mattias_ta.position", (err, result)=>{
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
            throw err;
        }
        else{
            console.log(results);
            res.render("addrelations", {personList: results[0], movieList: results[1], positionList: results[2]});
        }
    });
};

//@desc adding relations between people, movies and positions into the eestifilm database
//@route GET /api/eestifilm
//@access private

const estFilmAddingRelations = (req, res)=>{
    let roleValue = req.body.roleInput;
    let sqlReq = "INSERT INTO person_in_movie (person_id, movie_id, position_id, role) VALUES (?,?,?,?)";
    console.log(req.body.personSelect, req.body.movieSelect, req.body.positionSelect, req.body.roleInput);
    if(req.body.roleInput == ""){
        roleValue = null;
    }
    conn.execute(sqlReq, [req.body.personSelect, req.body.movieSelect, req.body.positionSelect, roleValue], (err, sqlRes)=>{
        if(err){
            console.log(err);
            res.render("eestifilm");
        }
        else{
            console.log(sqlRes);
            console.log("Success!");
            res.render("eestifilm");
        }
    });
};

module.exports = {
    estFilmHome,
    estFilmPeople,
    estFilmRelations,
    estFilmAddData,
    estFilmAddingData,
    estFilmAddRelations,
    estFilmAddingRelations
};