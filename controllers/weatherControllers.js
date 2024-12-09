//Linkidelt xml-i saamiseks
const axios = require("axios");
//JSON-isse teisendamiseks
const {XMLParser} = require("fast-xml-parser");
//@desc home page for news section
//@route GET /api/weather
//@access public

const weatherHome = (req, res)=>{
    axios.get("https://www.ilmateenistus.ee/ilma_andmed/xml/forecast.php")
    .then(response=>{
        const parser = new XMLParser();
        let weatherData = parser.parse(response.data);
        let locationData = weatherData.forecasts.forecast[0].day.place;
        let locationList = [];
        for (let i = 0; i < locationData.length; i++) {
            locationList.push(locationData[i].name);
        };
        res.render("weather", {
            estTxt: weatherData.forecasts.forecast[0].day.text,
            estMin: weatherData.forecasts.forecast[0].day.tempmin,
            estMax: weatherData.forecasts.forecast[0].day.tempmax,
            locations: locationList
        });
    })
    .catch(error=>{
        console.log(error);
        notice = "Ilmaandmeid ei saanud kätte!";
        res.redirect("index");
    })
    
};
const locationWeather = (req, res)=>{
    axios.get("https://www.ilmateenistus.ee/ilma_andmed/xml/forecast.php")
    .then(response=>{
        const parser = new XMLParser();
        let weatherData = parser.parse(response.data);
        let locationData = weatherData.forecasts.forecast[0].day.place[req.params.id];
        res.render("locationweather", {
            locName: locationData.name,
            locPhen: locationData.phenomenon,
            locMax: locationData.tempmax,
            locMin: weatherData.forecasts.forecast[0].day.tempmin
        });
    })
    .catch(error=>{
        console.log(error);
        notice = "Ilmaandmeid ei saanud kätte!";
        res.redirect("index");
    })
};

module.exports = {
    weatherHome,
    locationWeather
};