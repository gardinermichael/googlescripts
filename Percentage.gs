/**
 * Find Percentage Increase
 *
 * @param {} input The value to fuzzy match
 * @return The index
 * @customfunction
 */

function FINDPERCENTAGEDIFF(oldNum, newNum){
  return (((oldNum-newNum)/oldNum)*100) + '%+';
}
