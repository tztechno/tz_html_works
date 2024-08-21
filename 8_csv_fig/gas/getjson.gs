function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  const data = sheet.getDataRange().getValues();
  
  // データをJSON形式に変換
  const jsonData = [];
  for (let i = 1; i < data.length; i++) {
    jsonData.push({
      date: data[i][0],
      open: data[i][1]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(jsonData))
                      .setMimeType(ContentService.MimeType.JSON);
}
