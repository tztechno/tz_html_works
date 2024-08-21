function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  const data = sheet.getDataRange().getValues();
  
  // CSV形式のデータを生成
  let csvData = '';
  for (let i = 0; i < data.length; i++) {
    csvData += data[i].join(',') + '\n';
  }
  
  // CSVをクライアントに返す
  return ContentService.createTextOutput(csvData)
                       .setMimeType(ContentService.MimeType.CSV);
}
