// Get start date of year and week  
function getStartDateOfISOWeek(year, week) {
    var date = new Date(year, 0, 1 + (week - 1) * 7);
    var day = date.getDay();
    if (day <= 4)
        date.setDate(date.getDate() - date.getDay() + 1);
    else
        date.setDate(date.getDate() + 8 - date.getDay());
    return date;
}

// Get number of ISO weeks in a year
module.exports.getISOWeeks = function(year) {
    var d = new Date(year, 0, 1);
    var isLeap = new Date(year, 1, 29).getMonth() === 1;
    return d.getDay() === 4 || isLeap && d.getDay() === 3 ? 53 : 52
}

module.exports.getDate = function(year, week) {
    var start = getStartDateOfISOWeek(year, week);
    var m = new Date(year, 0, 1);
    return new Date(Math.max(start, m));
}

module.exports.getISOWeekFromDate = function(dt) {
     var tdt = new Date(dt.valueOf());
     var dayn = (dt.getDay() + 6) % 7;
     tdt.setDate(tdt.getDate() - dayn + 3);
     var firstThursday = tdt.valueOf();
     tdt.setMonth(0, 1);
     if (tdt.getDay() !== 4) 
       {
      tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
        }
     return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}