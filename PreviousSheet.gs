/**
 * Get Cell Value from Previous Sheet
 *
 * @param {} input The value to fuzzy match
 * @return The index
 * @customfunction
 */

function PREVIOUSCELL(relCol) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var curSheet = ss.getActiveSheet();
  if (curSheet < 2)
    return "There is no previous sheet";
  //var prevSheet = ss.getSheets()[curSheet.getIndex() - 2]; // Opposite Direction
  var preSheet = ss.getSheets()[curSheet.getIndex()];
  var curCel = curSheet.getActiveCell();
  return preSheet.getRange(curCel.getRow(), curCel.getColumn() + relCol).getValue();
}
