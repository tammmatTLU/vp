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
    let sqlReq = "SELECT id, news_title, news_date, last_edit FROM vp_news WHERE expire_date > DATE(NOW()) ORDER BY news_date DESC";
    conn.execute(sqlReq, (err, sqlRes)=>{
        if(err){
            res.render("readnews", {news: []});
        }
        else{
            res.render("readnews", {news: sqlRes});
        }
    });
};
const readArticle = (req, res)=>{
    let sqlReq = "SELECT news_title, news_text, news_date, first_name, last_name FROM vp_news JOIN vp_users ON vp_news.user_id = vp_users.id WHERE vp_news.id = ?";
    conn.execute(sqlReq, [req.params.id], (err, sqlRes)=>{
        if(err){
            console.log("Ei saanud artiklit kätte!");
            throw err;
        } else {
            res.render("article", {
                title: sqlRes[0].news_title,
                content: sqlRes[0].news_text,
                date: sqlRes[0].news_date,
                author: sqlRes[0].first_name + " " + sqlRes[0].last_name});
        }
    });
};

//@desc page for editing news
//@route GET /api/news
//@access private

const editNews = (req, res)=>{
    let sqlReq = "SELECT id, news_title, news_date, last_edit FROM vp_news WHERE expire_date > DATE(NOW()) AND user_id = ? ORDER BY news_date DESC";
    conn.execute(sqlReq, [req.session.userId], (err, sqlRes)=>{
        if(err){
            res.render("editnews", {news: []});
        }
        else{
            res.render("editnews", {news: sqlRes});
        }
    });
};

//@desc page for editing news
//@route GET /api/news
//@access private

const editArticle = (req, res)=>{
    let sqlReq = "SELECT news_title, news_text, DATE_FORMAT(expire_date, '%Y-%m-%d') AS expiration_date FROM vp_news WHERE vp_news.id = ?";
    conn.execute(sqlReq, [req.params.id], (err, sqlRes)=>{
        if(err){
            console.log("Ei saanud artiklit kätte!");
            throw err;
        } else {
            res.render("editarticle", {
                title: sqlRes[0].news_title,
                content: sqlRes[0].news_text,
                expirationDate: sqlRes[0].expiration_date,
            });
        }
    });
};

//@desc editing news
//@route GET /api/news
//@access private

const editingArticle = (req, res)=>{
    if(!req.body.titleInput || !req.body.contentInput || !req.body.expireInput){
		console.log('Uudisega jama');
		notice = 'Andmeid puudu!';
		res.render('addnews', {notice: notice});
	} else {
		let sqlReq = 'UPDATE vp_news SET news_title = ?, news_text = ?, expire_date = ?, last_edit = NOW() WHERE id=?';
        //andmebaasi osa
        conn.execute(sqlReq, [req.body.titleInput, req.body.contentInput, req.body.expireInput, req.params.id], (err, result)=>{
            if(err) {
                notice = 'Uudise muutmine ebaõnnestus!';
                res.redirect('/news/edit');
                throw err;
            } else {
                notice = 'Uudis edukalt muudetud!';
                res.redirect('/news/edit');
            }
        });
        //andmebaasi osa lõppeb
    }
};


module.exports = {
    newsHome,
    addNews,
    addingNews,
    newsList,
    readArticle,
    editNews,
    editArticle,
    editingArticle
};