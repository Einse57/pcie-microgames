/**
 * Google Apps Script: append poll votes to a Sheet.
 *
 * Setup:
 * 1. Create a Google Sheet with header row: timestamp | topic | note | ua
 * 2. Extensions → Apps Script → paste this file → Deploy → New deployment
 *    Type: Web app · Execute as: Me · Who has access: Anyone
 * 3. Copy the web app URL into Vercel env FEEDBACK_WEBHOOK_URL (Production + Preview)
 * 4. Redeploy pcie-microgames
 */
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.at || new Date().toISOString(),
    data.topic || '',
    data.note || '',
    data.ua || '',
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
    ContentService.MimeType.JSON,
  );
}
