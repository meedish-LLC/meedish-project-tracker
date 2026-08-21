function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Convert 2D array to array of objects
  const headers = data[0];
  const rows = data.slice(1);
  
  const result = rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const body = JSON.parse(e.postData.contents);
  
  // If it's a new item
  if (body.action === 'add') {
    sheet.appendRow([
      body.id || Utilities.getUuid(),
      body.name,
      body.status,
      body.dueDate,
      new Date().toISOString()
    ]);
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Added' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // If updating status (just an example, real update would find the row)
  if (body.action === 'update') {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === body.id) {
        sheet.getRange(i + 1, 3).setValue(body.status); // Assuming status is 3rd column
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Updated' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
}

// OPTIONS request handler for CORS
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
