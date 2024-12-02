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
        //console.log(weatherData.forecasts.forecast[0]);
        console.log(weatherData.forecasts.forecast[0].day.place);
        let locationData = weatherData.forecasts.forecast[0].day.place;
        let locationList = [];
        for (let i = 0; i < locationData.length; i++) {
            locationList.push(locationData[i].name);
        };
        console.log(locationList);
        res.render("weather", {
            estTxt: weatherData.forecasts.forecast[0].day.text,
            estMin: weatherData.forecasts.forecast[0].day.tempmin,
            estMax: weatherData.forecasts.forecast[0].day.tempmax,
        });
    })
    .catch(error=>{
        console.log(error);
        notice = "Ilmaandmeid ei saanud kätte!";
        res.render("weather", {notice: notice});
    })
    
};
const locationWeather = (req, res)=>{

};

module.exports = {
    weatherHome,
    locationWeather
};