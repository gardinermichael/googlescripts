function myFunction() {
  var monthFolders = DriveApp.getFoldersByName("6. June 2022");
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var logSheet = spreadsheet.getActiveSheet();
  while (monthFolders.hasNext()) {
    var monthFolder = monthFolders.next();
    showFolders = monthFolder.getFolders();
    while (showFolders.hasNext()) {
      var showFolder = showFolders.next();
      Logger.log(showFolder.getName());
      if(!searchForCellValue(spreadsheet, showFolder.getName())){
        logSheet.appendRow([showFolder.getName()])
      }

    }
  }
}


function makeShortcuts(){
  var monthFolders = DriveApp.getFoldersByName("6. June 2022");
  var sheet = SpreadsheetApp.getActive().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  clearFolder("~Rooftop");
  clearFolder("~Jazz/Global");
  clearFolder("~Fem Led");
  clearFolder("~Garage");
  data.forEach(function (row) {
    if(row[6] && row[6] != "Rooftop"){
      makeShortcut("~Rooftop", row[0])
      Logger.log(row[0]);
    }
    if(row[7] && row[7] != "Jazz/Global"){
      makeShortcut("~Jazz/Global", row[0])
      Logger.log(row[0]);
    }
    if(row[8] && row[8] != "Fem Led"){
      makeShortcut("~Fem Led", row[0])
      Logger.log(row[0]);
    }
    if(row[9] && row[9] != "Garage"){
      makeShortcut("~Garage", row[0])
      Logger.log(row[0]);
    }
  });
}


function clearFolder(parentFolder){
  rooftopFolders = DriveApp.getFoldersByName(parentFolder);
  while (rooftopFolders.hasNext()) {
    var rooftopFolder = rooftopFolders.next();

    while (rooftopFolder.getFiles().hasNext()) {
      const file = rooftopFolder.getFiles().next();
      Logger.log('Moving file to trash: ', file);
      file.setTrashed(true);
      // Delete File
      // Drive.Files.remove(file.getId())
    }
  }
}

function makeShortcut(parentFolder, childFolder){
  rooftopFolders = DriveApp.getFoldersByName(parentFolder);
  while (rooftopFolders.hasNext()) {
    var rooftopFolder = rooftopFolders.next();

    showFolders = DriveApp.getFoldersByName(childFolder);
    while (showFolders.hasNext()) {
      var showFolder = showFolders.next();
      if(parentFolder == "~Rooftop"){
        folderColor.setColorByName(showFolder.getId(),"Wild strawberries");
      }
      if(parentFolder == "~Jazz/Global"){
        folderColor.setColorByName(showFolder.getId(),"Yellow cab");
      }
      if(parentFolder == "~Fem Led"){
        folderColor.setColorByName(showFolder.getId(),"Rainy sky");
      }
      if(parentFolder == "~Garage"){
        folderColor.setColorByName(showFolder.getId(),"Asparagus");
      }
      shortcut = DriveApp.createShortcut(showFolder.getId());
      shortcut.moveTo(rooftopFolder);
    }
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


// https://medium.com/@stephane.giron/change-google-drive-folder-color-with-apps-script-259743ab1c30

function manageColor() {
  var id = 'YOUR FOLDER ID'; // We don't check it is a valid folder ID, we trust you ;-)
  
  //Get folder color name
  Logger.log(folderColor.getName(id));
  
  // Get color Hexadecimal code
  Logger.log(folderColor.getHexa(id));
  
  //Change color of folder by name
  Logger.log(folderColor.setColorByName(id,'Slime green'))
  
  // Change color of folder by Hexadecimal code
  // Logger.log(folderColor.setColorByHexa(id,'#ac725e'))
  
}


/**
 * Use folderColor to manage Folder color
 * Get color Name or Hexadecimal code
 * Change color by Name or Hexadecimal code
 */
 
var folderColor = {}

/**
 * Set methods
 */

// Set folder color by name

folderColor.setColorByName = function(id,name){
  if(!colorPalette[name]){
    throw "Name is not valid, please check name in colorPalette.";
  }
  this.setColor(id,colorPalette[name]);
  return true;
}

// Set folder color by Hexadecimal code

folderColor.setColorByHexa = function(id,hexa){
  for(var key in colorPalette){
    if(hexa == colorPalette[key]){
      break;
    }
    throw "Hexadecimal color code is not a valid code.";
  }
  this.setColor(id,hexa);
  return true;
}

/**
 * Get methods
 */

// Get Hexadecimal code of the color used

folderColor.getHexa = function(id){
  var color = this.getColor(id);
  return color.folderColorRgb;
}

//Get Color name

folderColor.getName = function(id){
  var hexa = this.getHexa(id);
  Logger.log(hexa)
  for(var key in colorPalette){
    Logger.log(key + ' : ' + colorPalette[key])
    if(hexa == colorPalette[key]){
      return key
    }
  }
  throw "Error to get the color name please check Hexa value : "+hexa;
}

/**
 * Helper methods for request and scope
 */

// Just there for scope

folderColor.init = function(){
  //This function do nothing, there just for scope
  //DriveApp.createFile(blob); For scope to be sure esit of files is possible.
  return this;
}

// Helper to query API and get color parameter

folderColor.getColor = function(id){
  var url = 'https://www.googleapis.com/drive/v2/files/'+id+'?fields=folderColorRgb';
   var param = {
    method      : "get",
    headers     : {"Authorization": "Bearer " + ScriptApp.getOAuthToken()}
  };
  var html = UrlFetchApp.fetch(url,param).getContentText();
  return JSON.parse(html);
}

// Helper to query API for setting color parameter

folderColor.setColor = function(id,hexa){
  var url = 'https://www.googleapis.com/drive/v2/files/'+id+'?fields=folderColorRgb';
  var param = {
    method      : "patch",
    contentType: 'application/json',
    headers     : {"Authorization": "Bearer " + ScriptApp.getOAuthToken()},
    payload: JSON.stringify({folderColorRgb:hexa})
  };
  var html = UrlFetchApp.fetch(url,param).getContentText();
  
  return html;
}

// Color Palette, list of color available.

var colorPalette = {
  "Chocolate ice cream":"#ac725e",
  "Old brick red":"#d06b64",
  "Cardinal":"#f83a22",
  "Wild strawberries":"#fa573c", //rooftop
  "Mars orange":"#ff7537",
  "Yellow cab":"#ffad46", //jazz
  "Spearmint":"#42d692",
  "Vern fern":"#16a765",
  "Asparagus":"#7bd148", // garage
  "Slime green":"#b3dc6c",
  "Desert sand":"#fbe983",
  "Macaroni":"#fad165",
  "Sea foam":"#92e1c0",
  "Pool":"#9fe1e7",
  "Denim":"#9fc6e7",
  "Rainy sky":"#4986e7", // fem
  "Blue velvet":"#9a9cff",
  "Purple dino":"#b99aff",
  "Mouse":"#8f8f8f",
  "Mountain grey":"#cabdbf",
  "Earthworm":"#cca6ac",
  "Bubble gum":"#f691b2",
  "Purple rain":"#cd74e6",
  "Toy eggplant":"#a47ae2"
 };
