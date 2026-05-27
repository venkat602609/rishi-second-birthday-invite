const SHEET_NAME = "RSVPs";
const SPREADSHEET_ID = "";
const SHARED_TOKEN = "";

const HEADERS = [
  "submittedAt",
  "name",
  "contact",
  "status",
  "guests",
  "message"
];

function doGet(e) {
  if (!isAuthorized_(e)) {
    return jsonp_(e, { entries: [] });
  }

  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return jsonp_(e, { entries: [] });
  }

  const entries = values.slice(1).reverse().map(function (row) {
    return {
      submittedAt: row[0] || "",
      name: row[1] || "",
      contact: row[2] || "",
      status: row[3] || "maybe",
      guests: row[4] || 1,
      message: row[5] || ""
    };
  });

  return jsonp_(e, { entries: entries });
}

function doPost(e) {
  if (!isAuthorized_(e)) {
    return json_({ ok: false, error: "Unauthorized" });
  }

  const payload = parsePayload_(e);
  const entry = {
    submittedAt: payload.submittedAt || new Date().toISOString(),
    name: clean_(payload.name),
    contact: clean_(payload.contact),
    status: normalizeStatus_(payload.status),
    guests: normalizeGuests_(payload.guests),
    message: clean_(payload.message)
  };

  if (!entry.name) {
    return json_({ ok: false, error: "Name is required" });
  }

  getSheet_().appendRow([
    entry.submittedAt,
    entry.name,
    entry.contact,
    entry.status,
    entry.guests,
    entry.message
  ]);

  return json_({ ok: true });
}

function getSheet_() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error("Spreadsheet not found. Set SPREADSHEET_ID in Code.gs.");
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  return sheet;
}

function parsePayload_(e) {
  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }

  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  return {};
}

function isAuthorized_(e) {
  if (!SHARED_TOKEN) {
    return true;
  }
  return e && e.parameter && e.parameter.token === SHARED_TOKEN;
}

function clean_(value) {
  return String(value || "").trim().slice(0, 500);
}

function normalizeStatus_(value) {
  const status = String(value || "maybe").toLowerCase();
  return ["yes", "no", "maybe"].indexOf(status) >= 0 ? status : "maybe";
}

function normalizeGuests_(value) {
  const guests = Number(value || 1);
  if (!Number.isFinite(guests)) {
    return 1;
  }
  return Math.max(1, Math.min(10, Math.round(guests)));
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(e, payload) {
  const callback = e && e.parameter && e.parameter.callback;
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + "(" + JSON.stringify(payload) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(payload);
}
