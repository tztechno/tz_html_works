
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index.html')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}


function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var text = e.parameter.textboxContent;
  sheet.appendRow([text]);
  return ContentService.createTextOutput("Success");
}
