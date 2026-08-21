function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  const headers = data[0];
  const rows = data.slice(1);
  
  const result = rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      // Checkpoints are stored as a JSON string, let's parse them back
      if (header === 'checkpoints') {
        try {
          obj[header] = JSON.parse(row[i] || "[]");
        } catch(e) {
          obj[header] = [];
        }
      } else {
        obj[header] = row[i];
      }
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const body = JSON.parse(e.postData.contents);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Create row data based on headers to ensure column alignment
  const createRowData = (taskData) => {
    return headers.map(header => {
      if (header === 'checkpoints') {
        return JSON.stringify(taskData[header] || []);
      }
      return taskData[header] || '';
    });
  };

  if (body.action === 'add') {
    sheet.appendRow(createRowData(body));
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Added' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (body.action === 'update') {
    const idIndex = headers.indexOf('id');
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] === body.id) {
        // Update entire row
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([createRowData(body)]);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Updated' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (body.action === 'delete') {
    const idIndex = headers.indexOf('id');
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] === body.id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Deleted' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}
