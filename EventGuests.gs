/*
Gets recent techs working at a place. They use Gcal for coordinating shifts, so pull from there and then compare with prod spreadsheet
Make sure everyone has their job position in the column after their email
They have to have an email to show up
There's gotta be a sheet called ACTIVE and Main
*/

function returnEmails(){
  var cal= CalendarApp.getCalendarById("");
  var today = new Date();
  var priorDate = new Date(new Date().setDate(today.getDate() - 30));

  var events = cal.getEvents(priorDate, today); 

  var fatArray = [];
  var singleArray = [];
  var badEmails = []

  events.forEach(function(value) {
    var guests = value.getGuestList();
    guests.forEach(function(value) {
      if(!badEmails.includes(value.getEmail())){
          fatArray.push(value.getEmail())
      }
        if(!singleArray.includes(value.getEmail()) && !badEmails.includes(value.getEmail())){
          singleArray.push(value.getEmail())
      }
    });
  });

  returnArray = [];
  singleArray.forEach(function(value) {
    count = fatArray.filter(x => x == value).length;
    returnArray.push([value, count])
  });

  return returnArray;
}

function getTechs(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mainSheet = ss.getSheetByName("Main");
  var rows = mainSheet.getDataRange().getValues();
  rows.shift(); // Get rid of header row

  var techs = [];
  var dupeTracker = [];
  
  rows.forEach(function(row) {
    if(!row[4].length == 0.0){
      if(!dupeTracker.includes(row[4])){
        techs.push([row[1], row[2], row[3], row[4], row[5]]);
      }
      dupeTracker.push(row[4]);
    }
  });

  return techs;
}

function runSync(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.getSheetByName("ACTIVE");

  var calTechs = returnEmails();
  var sheetTechs = getTechs();
  var sheetOutput = [];
  var header = [
    "First Name",
    "Last Name",
    "Phone",
    "Email",
    "Job",
    "#"
  ];
  sheetOutput.push(header);

  calTechs.forEach(function(calTech) {
    sheetTechs.forEach(function(sheetTech) {
        if(calTech[0] == sheetTech[3]){
            Logger.log(calTech);

            var tech = [
              sheetTech[0],
              sheetTech[1],
              sheetTech[2],
              sheetTech[3],
              sheetTech[4],
              calTech[1]
            ];

            sheetOutput.push(tech);
        }
    });      
  });
  activeSheet.clearContents();
  activeSheet.getRange(1, 1, sheetOutput.length, 6).setValues(sheetOutput);
}


function onOpen( ){
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Techs')
    .addItem('Get Recent Techs', 'runSync')
    .addToUi();
}
