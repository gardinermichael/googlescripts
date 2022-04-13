function outputFolders() {
  var folders = DriveApp.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next();
    Logger.log(folder.getName());
  }
}

function searchForCellValue(spreadSheet, toSearch){
  var tf = spreadSheet.createTextFinder(toSearch);
  var all = tf.findAll();
  
  for (var i = 0; i < all.length; i++) {
    // Logger.log('The sheet %s, cell %s, has the value %s.', all[i].getSheet().getName(), all[i].getA1Notation(), all[i].getValue());
    return [all[i].getRow(), all[i].getColumn()];
  }
}


function run(){
  //5. May 2022

  var monthFolders = DriveApp.getFoldersByName("5. May 2022");
  while (monthFolders.hasNext()) {
    var monthFolder = monthFolders.next();
    showFolders = monthFolder.getFolders();
    while (showFolders.hasNext()) {
      var showFolder = showFolders.next();


      var files = showFolder.getFiles();
      var filesNamesArray = [];
      // var lateNightPresent = false;
      var rooftopDJPresent = false;

      var rosPresent = false;
      var settlementPresent = false;

      var dealPresent = false;
      var dealSheetID = "";
      var templateName = "";
      var linksDocCreated = false;



      while (files.hasNext()) {
        var file = files.next();
        filesNamesArray.push(file.getName().toLowerCase());

        if(/rooftop dj/.test(file.getName().toLowerCase())){
          rooftopDJPresent = true;
        } 
        if(file.getName().toLowerCase().indexOf("ros") > 0){
          rosPresent = true;
        } 
        if(file.getName().toLowerCase().indexOf("settlement") > 0){
          settlementPresent = true;
        } 
        if(!dealPresent && file.getName().toLowerCase().indexOf("deal sheet") > 0){
          dealPresent = true;
          dealSheetID = file.getId();
          templateName = file.getName().slice(0, file.getName().toLowerCase().indexOf("deal sheet"))
        } 
      }

      if(!filesNamesArray.includes("links // info")){
        var doc = DocumentApp.create('LINKS // INFO');
        var docFile = DriveApp.getFileById(doc.getId());
        docFile.moveTo(showFolder);
        linksDocCreated = true;
        Logger.log("Links // Info Created")
      }

      if(dealPresent && rooftopDJPresent){
        var spreadSheet = SpreadsheetApp.openById(dealSheetID);
        var sheet = spreadSheet.getSheets()[0];
        var advanceTicketPrice = sheet.getRange(searchForCellValue(spreadSheet, "Ticket Price")[0],searchForCellValue(spreadSheet, "Ticket Price")[1]+1).getValue();
        var doorTicketPrice = sheet.getRange(searchForCellValue(spreadSheet, "Ticket Price")[0],searchForCellValue(spreadSheet, "Ticket Price")[1]+2).getValue();
        var eventTitle = sheet.getRange(searchForCellValue(spreadSheet, "Event:")[0],searchForCellValue(spreadSheet, "Event:")[1]+1).getValue();
        var eventDate = sheet.getRange(searchForCellValue(spreadSheet, "Show Date")[0],searchForCellValue(spreadSheet, "Show Date")[1]+1).getValue();
        var eventTime = sheet.getRange(searchForCellValue(spreadSheet, "Door")[0],searchForCellValue(spreadSheet, "Door")[1]+1).getValue();

        var dealSheetURL = spreadSheet.getUrl();
        var settlementSheetURL = "";
        var rosURL = "";


        if(!settlementPresent){
          var templateSettlementSheet = DriveApp.getFileById("");
          var newSettlementSheet = templateSettlementSheet.makeCopy((templateName + "SETTLEMENT SHEET"),showFolder);
          var newSpreadsheet = SpreadsheetApp.openById(newSettlementSheet.getId());
          var newsheet = newSpreadsheet.getSheets()[0];
          newsheet.getRange("G16").setValue(eventTitle);
          newsheet.getRange("G18").setValue(eventDate);
          if(advanceTicketPrice){
            newsheet.getRange("G20").setValue(advanceTicketPrice);
          } else{
            newsheet.getRange("G20").setValue("TBD");
          }
          if(doorTicketPrice){
            newsheet.getRange("G27").setValue(doorTicketPrice);
          } else{
            newsheet.getRange("G27").setValue("TBD");
          }

          settlementSheetURL = newSpreadsheet.getUrl();
        }

        var ticketPrice = 'n/a';

        if(!rosPresent){
          var templateROS = DriveApp.getFileById("");
          var rosDoc = templateROS.makeCopy((templateName + "ROS"),showFolder);
          var body = DocumentApp.openById(rosDoc.getId());
          var text = body.editAsText();

          text.findText("SHOW BILLING: ").getElement().appendText(eventTitle);
          text.findText("SHOW BILLING: ").getElement().setBold(false);
          text.findText("SHOW BILLING: ").getElement().setBold(0, 13, true);

          text.findText("SHOW DATE: ").getElement().appendText(Utilities.formatDate(eventDate,"GMT", "M/dd/yy"));
          text.findText("SHOW DATE: ").getElement().setBold(false);
          text.findText("SHOW DATE: ").getElement().setBold(0, 10, true);

          if(doorTicketPrice){
            ticketPrice = '$' + doorTicketPrice + ' ($' + (doorTicketPrice + 2) + ' w/CC)';
          } else {
            ticketPrice = "TBD";
          }

          text.findText("TICKET PRICE").getElement().appendText(ticketPrice);
          text.findText("TICKET PRICE").getElement().setBold(false);
          text.findText("TICKET PRICE").getElement().setBold(0, 16, true);

          text.findText("DOOR TIMES: ").getElement().appendText(Utilities.formatDate(new Date(eventTime),"GMT-06:00", "hh:mm a"));
          text.findText("DOOR TIMES: ").getElement().setBold(false);
          text.findText("DOOR TIMES: ").getElement().setBold(0, 11, true);

          rosURL = body.getUrl();
        }

        if(!rosPresent || !settlementPresent || linksDocCreated){
          var logSpreadsheet = SpreadsheetApp.openById("");
          var logSheet = logSpreadsheet.getSheets()[0];
          logSheet.appendRow([
            new Date(),
            showFolder.getName(),
            showFolder.getUrl(),
            dealSheetURL,
            settlementSheetURL,
            rosURL,
            (advanceTicketPrice ? advanceTicketPrice : 'TBD'),
            (doorTicketPrice ? doorTicketPrice : 'TBD'),
            ticketPrice,
            linksDocCreated,
            Utilities.formatDate(eventDate,"GMT", "M/dd/yy"),
            Utilities.formatDate(new Date(eventTime),"GMT-06:00", "hh:mm a"),
          ]);
        }
      }
    }
  }
}