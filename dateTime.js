const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsmeber"];
const dayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];

const dateFormattedEt = function(){
    var timeNow = new Date();
    return timeNow.getDate() + ". " + monthNamesEt[timeNow.getMonth()] + " " + timeNow.getFullYear();
};
const dayOfWeekEt = function(){
    var timeNow = new Date();
    return dayNamesEt[timeNow.getDay()];
};
const timeFormattedEt = function(){
    var timeNow = new Date();
    return timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();
};
const partOfDayEt = function() {
    let dayPart = "suvaline aeg";
    if (new Date().getDay() > 0 && new Date().getDay() < 5){
        if (new Date().getHours() < 8){
            dayPart = "Uneaeg"
        }
        else if (new Date().getHours() > 15){
            dayPart = "Vaba aeg"
        }
        else{
            dayPart = "Kooliaeg"
        }
    }
    else if (new Date().getDay() > 4){
        if (new Date().getHours() > 1 && new Date().getHours() < 12){
            dayPart = "Uneaeg"
        }
        else if (new Date().getHours() > 11 && new Date().getHours() < 19){
            dayPart = "Vaba aeg"
        }
        else{
            dayPart = "PIDU!!!"
        }
    }
    else if (new Date().getDay() == 0){
        if (new Date().getHours() < 2){
            dayPart = "PIDU!!!"
        }
        else if (new Date().getHours() > 1 && new Date().getHours() < 12){
            dayPart = "Uneaeg"
        }
        else{
            dayPart = "Puhkeaeg"
        }
    }
    return dayPart;
};
//ekspordin kõik vajaliku
module.exports = {dateFormattedEt: dateFormattedEt, dayOfWeekEt: dayOfWeekEt, timeFormattedEt: timeFormattedEt, partOfDayEt: partOfDayEt, monthNamesEt: monthNamesEt, dayNamesEt: dayNamesEt};