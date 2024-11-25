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

//@desc home page for viljavedu section
//@route GET /api/viljavedu
//@access public
const viljaveduHome = (req, res)=>{
    res.render("viljavedu");
};

const viljaveduAddTruckIn = (req, res)=>{
    res.render("inc_truck");
};

const viljaveduAddingTruckIn = (req, res)=>{
    if(!req.body.truck || !req.body.massIn){
        notice = "Andmed pole täielikud!";
        res.render("inc_truck", {notice: notice});
    } else {
        sqlReq = "INSERT INTO vp_viljavedu (truck, mass_in) VALUES (?,?)";
        conn.execute(sqlReq, [req.body.truck, req.body.massIn], (err, sqlRes)=>{
            if(err){
                throw err;
            } else {
                notice = "Sisestatud!";
                res.render("inc_truck");
            }
        });
    }
};

const viljaveduAddTruckOut = (req, res)=>{
    sqlReq = "SELECT id, truck FROM vp_viljavedu WHERE mass_out IS NULL";
    conn.execute(sqlReq, (err, sqlRes)=>{
        if(err){
            throw err;
        } else {
            res.render("out_truck", {deliveryList: sqlRes});
        }
    });
};

const viljaveduAddingTruckOut = (req, res)=>{
    if(!req.body.massOut || !req.body.truck){
        notice = "Andmed pole täielikud, väljumist ei sisestatud!";
        res.render("viljavedu", {notice: notice});
    } else {
        sqlReq = "UPDATE vp_viljavedu SET mass_out = ? WHERE id = ?";
        conn.execute(sqlReq, [req.body.massOut, req.body.truck], (err, sqlRes)=>{
            if(err){
                throw err;
            } else {
                notice = "Sisestatud!";
                res.redirect("/viljavedu/out_truck");
            }
        });
    }
};

const viljaveduChooseSummary = (req, res)=>{
    sqlReq = "SELECT id, truck FROM vp_viljavedu WHERE mass_out IS NOT NULL";
    conn.execute(sqlReq, (err, sqlRes)=>{
        if(err){
            throw err;
        } else {
            res.render("summary", {deliveryList: sqlRes});
        }
    });
};

const viljaveduChoosingSummary = (req, res)=>{
    if(req.body.truckSubmit){
        if(!req.body.truckSelect){
            notice = "Valige auto number!"
            res.render("viljavedu", {notice: notice});
        } else {
            const myQueries = [
                function(callback){
                    conn.execute("SELECT mass_in, mass_out, DATE_FORMAT(date, '%M %d, %Y') AS readable_date FROM vp_viljavedu WHERE truck = ? AND mass_out IS NOT NULL", [req.body.truckSelect], (err, result)=>{
                        if(err) {
                            return callback(err);
                        }
                        else {
                            return callback(null, result);
                        }
                    });
                },
                function(callback){
                    conn.execute("SELECT SUM(mass_in) AS total_in, SUM(mass_out) AS total_out FROM vp_viljavedu WHERE truck = ? AND mass_out IS NOT NULL", [req.body.truckSelect], (err, result)=>{
                        if(err) {
                            return callback(err);
                        }
                        else {
                            return callback(null, result);
                        }
                    });
                }
            ];
            asyn.parallel(myQueries, (err, results)=>{
                if(err){
                    console.log(err);
                    notice = "Kokkuvõte on katki!"
                    res.render("viljavedu");
                }
                else{
                    res.render("summarized", {
                        truck: req.body.truckSelect,
                        deliveryList: results[0],
                        total: results[1][0].total_in - results[1][0].total_out
                    });
                }
            });
        }    
    } else if(req.body.allSubmit){
        const myQueries = [
            function(callback){
                conn.execute("SELECT truck, mass_in, mass_out, DATE_FORMAT(date, '%M %d, %Y') AS readable_date FROM vp_viljavedu WHERE mass_out IS NOT NULL", (err, result)=>{
                    if(err) {
                        return callback(err);
                    }
                    else {
                        return callback(null, result);
                    }
                });
            },
            function(callback){
                conn.execute("SELECT SUM(mass_in) AS total_in, SUM(mass_out) AS total_out FROM vp_viljavedu WHERE mass_out IS NOT NULL", (err, result)=>{
                    if(err) {
                        return callback(err);
                    }
                    else {
                        return callback(null, result);
                    }
                });
            }
        ];
        asyn.parallel(myQueries, (err, results)=>{
            if(err){
                console.log(err);
                notice = "Kokkuvõte on katki!"
                res.render("viljavedu");
            }
            else{
                res.render("summarized", {
                    truck: null,
                    deliveryList: results[0],
                    total: results[1][0].total_in - results[1][0].total_out
                });
            }
        });
    }
};

module.exports = {
    viljaveduHome,
    viljaveduAddTruckIn,
    viljaveduAddingTruckIn,
    viljaveduAddTruckOut,
    viljaveduAddingTruckOut,
    viljaveduChooseSummary,
    viljaveduChoosingSummary
};