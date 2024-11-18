const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");

const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase
});

//@desc home page for news section
//@route GET /api/news
//@access private

const newsHome = (req, res)=>{
    res.render("news");
};

//@desc page for adding news
//@route GET /api/news
//@access private

const addNews = (req, res)=>{
    res.render("addnews");
};

//@desc adding news
//@route POST /api/news
//@access private

const addingNews = (req, res)=>{
    if(!req.body.titleInput || !req.body.contentInput || !req.body.expireInput){
		console.log('Uudisega jama');
		notice = 'Andmeid puudu!';
		res.render('addnews', {notice: notice});
	} else {
		let sqlReq = 'INSERT INTO vp_news (news_title, news_text, expire_date, user_id) VALUES(?,?,?,?)';
        //andmebaasi osa
        conn.execute(sqlReq, [req.body.titleInput, req.body.contentInput, req.body.expireInput, req.session.userId], (err, result)=>{
            if(err) {
                notice = 'Uudise salvestamine ebaõnnestus!';
                res.render('addnews', {notice: notice});
                throw err;
            } else {
                notice = 'Uudis edukalt salvestatud!';
                res.render('addnews', {notice: notice});
            }
        });
        //andmebaasi osa lõppeb
    }
};

//@desc page for reading news headings
//@route GET /api/news
//@access private

const newsList = (req, res)=>{
    let sqlReq = "SELECT id, news_title, news_text, news_date FROM vp_news WHERE expire_date > DATE(NOW()) ORDER BY news_date DESC";
    conn.execute(sqlReq, (err, sqlRes)=>{
        if(err){
            res.render("readnews", {news: []});
        }
        else{
            res.render("readnews", {news: sqlRes});
        }
    });
};
const readArticle = 
module.exports = {
    newsHome,
    addNews,
    addingNews,
    newsList
};