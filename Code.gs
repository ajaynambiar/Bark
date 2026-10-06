/**
 * CLINIC ISSUE LOG - COMPLETE FIXED VERSION
 * ALL data comes from Config sheet - NO hardcoding
 */

// ==================== CONFIGURATION ====================
var SHEET_SUBMISSIONS = 'Submissions';
var SHEET_CONFIG = 'Config';
var SHEET_AUDIT = 'AuditLog';
var SHEET_SUGGESTIONS = 'Suggestions';
var SHEET_CONTACTS = 'Contacts';
var SHEET_SERVICES = 'Services';
var SHEET_DISCOUNTS = 'Discounts';
var SHEET_CALENDAR = 'Calendar';
var UPLOAD_FOLDER_NAME = 'Clinic Issue Log Uploads';
var SPREADSHEET_NAME = 'Clinic Issue Log';

var SUBMISSIONS_HEADERS = [
  'Timestamp', 'Logged-in Email', 'Is Escalation?', 'Target SLA', 'Assigned Team',
  'Agent Name', 'Ticket ID', 'Customer Phone', 'Category / Tool', 'Channel / Clinic',
  'Service / Queue', 'Issue Subtype', 'Description', 'File Link', 'Status',
  'FRT (Mins)', 'Manager Notes', 'Last Modified By', 'Last Modified At'
];

var CONFIG_HEADERS = ['Type', 'Key1', 'Key2', 'Value', 'SortOrder'];
var AUDIT_HEADERS = ['Timestamp', 'Row Index', 'Ticket ID', 'Old Status', 'New Status', 'Manager Note', 'Modified By'];
var SUGGESTIONS_HEADERS = ['Timestamp', 'Agent Name', 'Category / Tool', 'Description', 'Status', 'Admin Note'];
var CONTACTS_HEADERS = ['Type', 'Name', 'Email', 'Phone', 'Role', 'Team', 'SortOrder'];
var SERVICES_HEADERS = ['Service', 'Description', 'Price', 'DiscountEligible', 'SortOrder'];
var DISCOUNTS_HEADERS = ['Code', 'Description', 'DiscountPercent', 'ValidUntil', 'ApplicableServices', 'SortOrder'];
var CALENDAR_HEADERS = ['Date', 'Time', 'Event', 'Attendees', 'Type', 'SortOrder'];

var COL = {
  TIMESTAMP: 1, EMAIL: 2, ESCALATION: 3, TARGET_SLA: 4, ASSIGNED_TEAM: 5,
  AGENT_NAME: 6, TICKET_ID: 7, PHONE: 8, TOOL: 9, CHANNEL_CLINIC: 10,
  SERVICE_QUEUE: 11, ISSUE_SUBTYPE: 12, DESCRIPTION: 13, FILE_LINK: 14,
  STATUS: 15, FRT_MINS: 16, MANAGER_NOTES: 17, LAST_MOD_BY: 18, LAST_MOD_AT: 19
};

// ==================== WEB APP ENTRY ====================

function doGet(e) {
  try {
    initDatastore();
    var page = (e && e.parameter && e.parameter.page) ? e.parameter.page : '';
    
    if (page === 'management') {
      var tmpl = HtmlService.createTemplateFromFile('Management');
      return tmpl.evaluate()
        .setTitle('Clinic Issue Log — TL Dashboard')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } else {
      var tmpl = HtmlService.createTemplateFromFile('Index');
      return tmpl.evaluate()
        .setTitle('Clinic Issue Log — Supertails Inside Sales')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  } catch (error) {
    return HtmlService.createHtmlOutput('<h1>Error</h1><p>' + error.message + '</p>');
  }
}

// ==================== DATASTORE SETUP ====================

function getSpreadsheet_() {
  var bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) return bound;

  return SpreadsheetApp.openById('1tqZHcfnF0CoupyjHR8pYXYZMODh7sdW0Trw6qoYrLuA');
}

function initDatastore() {
  var ss = getSpreadsheet_();
  
  var sheets = {
    'Submissions': SUBMISSIONS_HEADERS,
    'Config': CONFIG_HEADERS,
    'AuditLog': AUDIT_HEADERS,
    'Suggestions': SUGGESTIONS_HEADERS,
    'Contacts': CONTACTS_HEADERS,
    'Services': SERVICES_HEADERS,
    'Discounts': DISCOUNTS_HEADERS,
    'Calendar': CALENDAR_HEADERS
  };
  
  Object.keys(sheets).forEach(function(name) {
    var sheet = getOrCreateSheet(ss, name);
    ensureHeaders(sheet, sheets[name]);
  });
  
  var configSheet = ss.getSheetByName('Config');
  var hasDataRows = configSheet.getLastRow() > 1;
  if (!hasDataRows) {
    seedConfig(configSheet);
  }
  
  seedDefaultData(ss);
  
  try {
    var defaultSheet = ss.getSheetByName('Sheet1');
    if (defaultSheet && defaultSheet.getLastRow() === 0 && defaultSheet.getLastColumn() === 0) {
      ss.deleteSheet(defaultSheet);
    }
  } catch (e) {}
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  var firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var hasHeaders = firstRow && firstRow.join('') !== '';
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return !hasHeaders;
}

function seedDefaultData(ss) {
  var contactsSheet = ss.getSheetByName('Contacts');
  if (contactsSheet.getLastRow() < 2) {
    var contacts = [
      ['Tech', 'Rajesh Kumar', 'rajesh@supertails.com', '9876543210', 'Team Lead', 'Product/Tech', 1],
      ['Tech', 'Priya Singh', 'priya@supertails.com', '9876543211', 'Senior Developer', 'Product/Tech', 2],
      ['CRM', 'Amit Patel', 'amit@supertails.com', '9876543212', 'CRM Manager', 'CRM', 1],
      ['Telephony', 'Sneha Reddy', 'sneha@supertails.com', '9876543213', 'Telephony Lead', 'Telephony', 1],
      ['Clinic', 'Dr. Vikram', 'vikram@supertails.com', '9876543214', 'Clinic Manager', 'ClinicOps', 1],
      ['Escalation', 'Manager', 'manager@supertails.com', '9876543215', 'Escalation Contact', 'Management', 1]
    ];
    if (contacts.length) {
      contactsSheet.getRange(2, 1, contacts.length, CONTACTS_HEADERS.length).setValues(contacts);
    }
  }
  
  var servicesSheet = ss.getSheetByName('Services');
  if (servicesSheet.getLastRow() < 2) {
    var services = [
      ['Vet Consultation', 'Professional veterinary consultation', '500', 'Yes', 1],
      ['Vaccination', 'Pet vaccination services', '800', 'Yes', 2],
      ['Grooming', 'Professional pet grooming', '1200', 'Yes', 3],
      ['Diagnostics', 'Pet diagnostic services', '1500', 'No', 4]
    ];
    if (services.length) {
      servicesSheet.getRange(2, 1, services.length, SERVICES_HEADERS.length).setValues(services);
    }
  }
  
  var discountsSheet = ss.getSheetByName('Discounts');
  if (discountsSheet.getLastRow() < 2) {
    var discounts = [
      ['WELCOME10', 'First visit welcome discount', '10', '2025-12-31', 'All', 1],
      ['REFER20', 'Referral discount', '20', '2025-12-31', 'All', 2],
      ['CLINIC15', 'Clinic partnership discount', '15', '2025-06-30', 'Vet Consultation,Diagnostics', 3]
    ];
    if (discounts.length) {
      discountsSheet.getRange(2, 1, discounts.length, DISCOUNTS_HEADERS.length).setValues(discounts);
    }
  }
  
  var calendarSheet = ss.getSheetByName('Calendar');
  if (calendarSheet.getLastRow() < 2) {
    var today = new Date();
    var events = [
      [formatDate(today), '10:00', 'Team Meeting', 'All Team', 'Meeting', 1],
      [formatDate(addDays(today, 1)), '14:00', 'Tech Sync', 'Tech Team', 'Meeting', 2],
      [formatDate(addDays(today, 2)), '11:00', 'Manager Review', 'Managers', 'Review', 3]
    ];
    if (events.length) {
      calendarSheet.getRange(2, 1, events.length, CALENDAR_HEADERS.length).setValues(events);
    }
  }
}

function formatDate(date) {
  var d = new Date(date);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function seedConfig(sheet) {
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, CONFIG_HEADERS.length).clearContent();
  }
  
  var rows = [];
  
  ['Ajay Nambiar', 'Priya Sharma', 'Rohit Verma', 'Sneha Iyer', 'Karthik Rao'].forEach(function(name, i) {
    rows.push(['Agent', name, '', '', i + 1]);
  });
  
  var activeEmail = Session.getActiveUser().getEmail();
  if (activeEmail && activeEmail !== '') {
    rows.push(['ManagerEmail', activeEmail, '', '', 1]);
  }
  rows.push(['ManagerEmail', 'manager@supertails.com', '', '', 2]);
  
  rows.push(['Tool', 'PawCare', 'PawCare', '🐾', 1]);
  rows.push(['Tool', 'Nugget', 'Nugget', '📋', 2]);
  rows.push(['Tool', 'Ameyo', 'Ameyo', '📞', 3]);
  rows.push(['Tool', 'Ticket', 'Ticket', '🎫', 4]);
  rows.push(['Tool', 'ClinicOps', 'Clinic Ops', '🏥', 5]);
  
  ['Clinic IB', 'Clinic OB New Leads', 'Clinic OB Existing', 'Confirmation Calling'].forEach(function(name, i) {
    rows.push(['Channel', 'Ticket', name, '', i + 1]);
  });
  ['Login / Access', 'App Sync Issue', 'App Crash / Freeze', 'Other'].forEach(function(name, i) {
    rows.push(['Channel', 'PawCare', name, '', i + 1]);
  });
  
  [
    'Koramangala', 'Banashankari', 'Brookfield', 'Bannerghatta', 'Kalyan Nagar',
    'KR Puram', 'Whitefield', 'Hosur Road', 'RT Nagar', 'RMV', 'Rajajinagar', 'Indiranagar'
  ].forEach(function(name, i) {
    rows.push(['Clinic', name, '', '', i + 1]);
  });
  
  ['Vet Consultation', 'Vaccination', 'Grooming', 'Diagnostics'].forEach(function(name, i) {
    rows.push(['Service', 'ClinicOps', name, '', i + 1]);
  });
  
  var issueMap = {
    'Nugget': [
      'Inbound call received but no ticket created',
      'Not able to dispose the ticket',
      'Auto-merging of tickets not working'
    ],
    'Ameyo': [
      'Not able to make outbound calls',
      'Not able to use AUX',
      'Applied AUX but automatically came online',
      'Not able to dispose the call',
      'Not able to login to Ameyo'
    ],
    'PawCare|Login / Access': [
      'Unable to login to PawCare',
      'OTP not received',
      'Account locked'
    ],
    'PawCare|App Sync Issue': [
      'Appointment not syncing',
      'Customer data mismatch',
      'Payment status not updated'
    ],
    'PawCare|App Crash / Freeze': [
      'App crashes on opening',
      'App freezes during booking',
      'App crashes while uploading file'
    ],
    'PawCare|Other': [
      'Other issue not listed above'
    ],
    'Ticket|Clinic IB': [
      'Phone number not updated in the ticket',
      'Wrong ticket created',
      'Duplicate ticket created under same customer',
      'Customer already booked but ABC ticket created',
      'Customer already visited but No-Show ticket created',
      'Customer cancelled appointment but No-Show ticket created',
      'Customer rescheduled appointment but No-Show ticket created',
      'Incorrect follow-up ticket created'
    ],
    'Ticket|Clinic OB New Leads': [
      'Lead not updated after call',
      'Wrong disposition selected',
      'Duplicate lead ticket created'
    ],
    'Ticket|Clinic OB Existing': [
      'Existing customer ticket not linked',
      'Follow-up ticket missing',
      'Wrong status updated on ticket'
    ],
    'Ticket|Confirmation Calling': [
      'Confirmation call not logged',
      'Wrong appointment confirmed',
      'Ticket not closed after confirmation'
    ],
    'ClinicOps|Vet Consultation': [
      'Long waiting time at clinic',
      'Groomer took leave — appointment cancelled',
      'Roster not updated — slots not showing in PawCare',
      'Clinic cancelled appointment without informing customer',
      'Customer visited but invoice not generated',
      'Bad service experience reported by customer'
    ],
    'ClinicOps|Vaccination': [
      'Vaccine stock not available',
      'Appointment slot not showing',
      'Wrong vaccine schedule updated'
    ],
    'ClinicOps|Grooming': [
      'Groomer unavailable',
      'Grooming package not updated correctly',
      'Customer complaint about service quality'
    ],
    'ClinicOps|Diagnostics': [
      'Lab report delayed',
      'Sample collection missed',
      'Incorrect report shared with customer'
    ]
  };
  
  Object.keys(issueMap).forEach(function(pathKey) {
    issueMap[pathKey].forEach(function(issueText, i) {
      rows.push(['Issue', pathKey, '', issueText, i + 1]);
    });
  });
  
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, CONFIG_HEADERS.length).setValues(rows);
  }
}

// ==================== CONFIG READERS ====================

function getConfigRows() {
  try {
    var ss = getSpreadsheet_();
    if (!ss) return [];
    
    var sheet = ss.getSheetByName('Config');
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, CONFIG_HEADERS.length).getValues();
    return values
      .filter(function(r) { return r && r[0] && String(r[0]).trim() !== ''; })
      .map(function(r) {
        return {
          type: String(r[0] || '').trim(),
          key1: String(r[1] || '').trim(),
          key2: String(r[2] || '').trim(),
          value: r[3] || '',
          sort: Number(r[4]) || 0
        };
      });
  } catch (e) {
    return [];
  }
}

function getManagerEmails() {
  var rows = getConfigRows();
  return rows
    .filter(function(r) { return r.type === 'ManagerEmail'; })
    .map(function(r) { return r.key1; })
    .filter(function(email) { return email && email.trim() !== ''; });
}

function getCurrentUserEmail() {
  var email = Session.getActiveUser().getEmail();
  return (email && email !== '') ? email : null;
}

function isManager() {
  var email = getCurrentUserEmail();
  if (!email) return false;
  var rows = getConfigRows();
  return rows.some(function(r) {
    return r.type === 'ManagerEmail' && String(r.key1).toLowerCase().trim() === email.toLowerCase().trim();
  });
}

// ==================== GET CONFIG DATA - MAIN FUNCTION ====================

function getInitialData() {
  try {
    var rows = getConfigRows();
    var userEmail = getCurrentUserEmail() || '';
    
    // Extract ALL data from Config sheet
    var agents = rows.filter(function(r) { return r.type === 'Agent'; })
      .sort(function(a, b) { return a.sort - b.sort; })
      .map(function(r) { return r.key1; });
    
    var tools = rows.filter(function(r) { return r.type === 'Tool'; })
      .sort(function(a, b) { return a.sort - b.sort; })
      .map(function(r) { return { id: r.key1, label: r.key2, icon: r.value }; });
    
    var channels = {};
    rows.filter(function(r) { return r.type === 'Channel'; })
      .sort(function(a, b) { return a.sort - b.sort; })
      .forEach(function(r) {
        if (!channels[r.key1]) channels[r.key1] = [];
        channels[r.key1].push(r.key2);
      });
    
    var clinics = rows.filter(function(r) { return r.type === 'Clinic'; })
      .sort(function(a, b) { return a.sort - b.sort; })
      .map(function(r) { return r.key1; });
    
    var services = {};
    rows.filter(function(r) { return r.type === 'Service'; })
      .sort(function(a, b) { return a.sort - b.sort; })
      .forEach(function(r) {
        if (!services[r.key1]) services[r.key1] = [];
        services[r.key1].push(r.key2);
      });
    
    var issues = {};
    rows.filter(function(r) { return r.type === 'Issue'; })
      .sort(function(a, b) { return a.sort - b.sort; })
      .forEach(function(r) {
        if (!issues[r.key1]) issues[r.key1] = [];
        issues[r.key1].push(String(r.value));
      });
    
    var managerEmails = rows.filter(function(r) { return r.type === 'ManagerEmail'; })
      .map(function(r) { return r.key1; });
    
    // Return COMPLETE data object
    return {
      agents: agents,
      tools: tools,
      channels: channels,
      clinics: clinics,
      services: services,
      issues: issues,
      managerEmails: managerEmails,
      currentUserEmail: userEmail,
      isManager: isManager()
    };
  } catch (error) {
    Logger.log('Error in getInitialData: ' + error.message);
    // Return empty data instead of failing
    return {
      agents: [],
      tools: [],
      channels: {},
      clinics: [],
      services: {},
      issues: {},
      managerEmails: [],
      currentUserEmail: '',
      isManager: false
    };
  }
}

// ==================== DATA FETCHERS ====================

function getContacts() {
  var ss = getSpreadsheet_();
  if (!ss) return [];
  var sheet = ss.getSheetByName('Contacts');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, CONTACTS_HEADERS.length).getValues();
  return values
    .filter(function(r) { return r && r[0] && String(r[0]).trim() !== ''; })
    .map(function(r) {
      return {
        type: String(r[0] || '').trim(),
        name: String(r[1] || '').trim(),
        email: String(r[2] || '').trim(),
        phone: String(r[3] || '').trim(),
        role: String(r[4] || '').trim(),
        team: String(r[5] || '').trim(),
        sortOrder: Number(r[6]) || 0
      };
    });
}

function getServices() {
  var ss = getSpreadsheet_();
  if (!ss) return [];
  var sheet = ss.getSheetByName('Services');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, SERVICES_HEADERS.length).getValues();
  return values
    .filter(function(r) { return r && r[0] && String(r[0]).trim() !== ''; })
    .map(function(r) {
      return {
        service: String(r[0] || '').trim(),
        description: String(r[1] || '').trim(),
        price: String(r[2] || '').trim(),
        discountEligible: String(r[3] || '').trim(),
        sortOrder: Number(r[4]) || 0
      };
    });
}

function getDiscounts() {
  var ss = getSpreadsheet_();
  if (!ss) return [];
  var sheet = ss.getSheetByName('Discounts');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, DISCOUNTS_HEADERS.length).getValues();
  return values
    .filter(function(r) { return r && r[0] && String(r[0]).trim() !== ''; })
    .map(function(r) {
      return {
        code: String(r[0] || '').trim(),
        description: String(r[1] || '').trim(),
        discountPercent: String(r[2] || '').trim(),
        validUntil: String(r[3] || '').trim(),
        applicableServices: String(r[4] || '').trim(),
        sortOrder: Number(r[5]) || 0
      };
    });
}

function getCalendarEvents() {
  var ss = getSpreadsheet_();
  if (!ss) return [];
  var sheet = ss.getSheetByName('Calendar');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, CALENDAR_HEADERS.length).getValues();
  return values
    .filter(function(r) { return r && r[0] && String(r[0]).trim() !== ''; })
    .map(function(r) {
      return {
        date: String(r[0] || '').trim(),
        time: String(r[1] || '').trim(),
        event: String(r[2] || '').trim(),
        attendees: String(r[3] || '').trim(),
        type: String(r[4] || '').trim(),
        sortOrder: Number(r[5]) || 0
      };
    });
}

function getSuggestions() {
  var ss = getSpreadsheet_();
  if (!ss) return [];
  var sheet = ss.getSheetByName('Suggestions');
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, SUGGESTIONS_HEADERS.length).getValues();
  return values
    .filter(function(r) { return r && r[0] && String(r[0]).trim() !== ''; })
    .map(function(r) {
      return {
        timestamp: r[0],
        agentName: String(r[1] || '').trim(),
        tool: String(r[2] || '').trim(),
        description: String(r[3] || '').trim(),
        status: String(r[4] || 'Under Review').trim(),
        adminNote: String(r[5] || '').trim()
      };
    });
}

function updateSuggestionStatus(rowIndex, newStatus, adminNote) {
  if (!isManager()) {
    throw new Error('Access restricted: you are not a manager.');
  }
  
  var ss = getSpreadsheet_();
  if (!ss) throw new Error('Cannot access spreadsheet.');
  
  var sheet = ss.getSheetByName('Suggestions');
  if (!sheet) throw new Error('Suggestions sheet not found.');
  
  rowIndex = Number(rowIndex);
  if (!rowIndex || rowIndex < 2 || rowIndex > sheet.getLastRow()) {
    throw new Error('Invalid suggestion row: ' + rowIndex);
  }
  
  if (newStatus) {
    sheet.getRange(rowIndex, 5).setValue(newStatus);
  }
  if (adminNote && String(adminNote).trim()) {
    sheet.getRange(rowIndex, 6).setValue(String(adminNote).trim());
  }
  
  return { success: true, rowIndex: rowIndex, newStatus: newStatus };
}

// ==================== SLA LOGIC ====================

function calculateSla(toolId, isEscalation) {
  if (!isEscalation) {
    return { priority: 'Standard', targetSla: '24 Hours', label: 'Standard logging protocol (Target SLA: 24h)' };
  }
  if (toolId === 'ClinicOps') {
    return { priority: 'P1', targetSla: '30 Mins', label: 'Priority: P1 - Target SLA: 30 Mins' };
  }
  if (toolId === 'PawCare' || toolId === 'Ameyo') {
    return { priority: 'P2', targetSla: '1 Hour', label: 'Priority: P2 - Target SLA: 1 Hour' };
  }
  return { priority: 'P3', targetSla: '2 Hours', label: 'Priority: P3 - Target SLA: 2 Hours' };
}

function assignedTeamFor(toolId) {
  var map = {
    PawCare: 'Product / Tech Team',
    Nugget: 'CRM Team',
    Ameyo: 'Telephony Team',
    Ticket: 'Ticketing Ops Team',
    ClinicOps: 'Clinic Operations Team'
  };
  return map[toolId] || 'General Support';
}

// ==================== SUBMIT ISSUE ====================

function submitIssue(data) {
  if (!data) throw new Error('No data received.');
  
  try {
    var ticketId = String(data.ticketId || '').trim().toUpperCase();
    var phone = String(data.phone || '').replace(/\D/g, '').slice(0, 10);
    var agentName = String(data.agentName || '').trim();
    var tool = String(data.tool || '').trim();
    var issueSubtype = String(data.issueSubtype || '').trim();
    
    if (!ticketId) throw new Error('Ticket ID is required.');
    if (phone.length !== 10) throw new Error('A valid 10-digit customer phone number is required.');
    if (!agentName) throw new Error('Please select your name.');
    if (!tool) throw new Error('Please select which tool/area has the issue.');
    if (!issueSubtype) throw new Error('Please select an issue.');
    
    var ss = getSpreadsheet_();
    if (!ss) throw new Error('Cannot access spreadsheet.');
    
    var sheet = ss.getSheetByName('Submissions');
    if (!sheet) throw new Error('Submissions sheet not found.');
    
    var fileLink = '';
    if (data.attachment && data.attachment.base64) {
      fileLink = uploadAttachment(data.attachment);
    }
    
    var isEscalation = !!data.isEscalation;
    var sla = calculateSla(tool, isEscalation);
    var team = assignedTeamFor(tool);
    var now = new Date();
    var userEmail = getCurrentUserEmail() || '';
    
    var row = [];
    row[COL.TIMESTAMP - 1] = now;
    row[COL.EMAIL - 1] = userEmail;
    row[COL.ESCALATION - 1] = isEscalation ? 'Yes' : 'No';
    row[COL.TARGET_SLA - 1] = sla.targetSla + ' (' + sla.priority + ')';
    row[COL.ASSIGNED_TEAM - 1] = team;
    row[COL.AGENT_NAME - 1] = agentName;
    row[COL.TICKET_ID - 1] = ticketId;
    row[COL.PHONE - 1] = phone;
    row[COL.TOOL - 1] = tool;
    row[COL.CHANNEL_CLINIC - 1] = String(data.channelOrClinic || '');
    row[COL.SERVICE_QUEUE - 1] = String(data.serviceOrQueue || '');
    row[COL.ISSUE_SUBTYPE - 1] = issueSubtype;
    row[COL.DESCRIPTION - 1] = String(data.description || '');
    row[COL.FILE_LINK - 1] = fileLink;
    row[COL.STATUS - 1] = 'New';
    row[COL.FRT_MINS - 1] = '';
    row[COL.MANAGER_NOTES - 1] = '';
    row[COL.LAST_MOD_BY - 1] = '';
    row[COL.LAST_MOD_AT - 1] = '';
    
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      sheet.appendRow(row);

      if (String(data.description || '').trim()) {
        var suggSheet = ss.getSheetByName('Suggestions');
        if (!suggSheet) {
          suggSheet = ss.insertSheet('Suggestions');
          ensureHeaders(suggSheet, SUGGESTIONS_HEADERS);
        }
        suggSheet.appendRow([now, agentName, tool, String(data.description).trim(), 'Under Review', '']);
      }
    } finally {
      lock.releaseLock();
    }
    
    try {
      sendNotifications(ticketId, tool, agentName, issueSubtype, sla, isEscalation, phone, data, fileLink);
    } catch (e) {
      Logger.log('Email notification failed: ' + e.message);
    }
    
    return {
      success: true,
      message: 'Issue logged successfully.',
      ticketId: ticketId,
      slaLabel: sla.label,
      fileLink: fileLink
    };
    
  } catch (error) {
    Logger.log('Error in submitIssue: ' + error.message);
    throw error;
  }
}

function uploadAttachment(attachment) {
  try {
    var raw = String(attachment.base64 || '');
    var commaIdx = raw.indexOf(',');
    var base64Data = commaIdx >= 0 ? raw.substring(commaIdx + 1) : raw;
    var mimeType = attachment.mimeType || 'application/octet-stream';
    var filename = attachment.filename || ('upload_' + new Date().getTime());
    
    var bytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, filename);
    
    var folder = getOrCreateUploadFolder();
    var file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}
    return file.getUrl();
  } catch (e) {
    return '';
  }
}

function getOrCreateUploadFolder() {
  var folders = DriveApp.getFoldersByName(UPLOAD_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(UPLOAD_FOLDER_NAME);
}

// ==================== EMAIL NOTIFICATIONS ====================

function sendNotifications(ticketId, tool, agentName, issueSubtype, sla, isEscalation, phone, data, fileLink) {
  var managers = getManagerEmails().filter(function (email) {
    return email && email.trim().toLowerCase() !== 'manager@supertails.com';
  });
  if (!managers || managers.length === 0) return;

  try {
    if (MailApp.getRemainingDailyQuota() < managers.length) {
      Logger.log('Skipping notification emails for ' + ticketId + ': daily MailApp quota nearly exhausted.');
      return;
    }
  } catch (e) {}

  var subject = '🔔 New Issue Logged: ' + ticketId;
  if (sla.priority === 'P1') {
    subject = '🚨 URGENT - ' + subject;
  } else if (isEscalation) {
    subject = '⚠️ ' + subject;
  }
  
  var body = 'A new issue has been logged:\n\n' +
    'Ticket ID: ' + ticketId + '\n' +
    'Tool: ' + tool + '\n' +
    'Agent: ' + agentName + '\n' +
    'Issue: ' + issueSubtype + '\n' +
    'Priority: ' + sla.priority + '\n' +
    'Target SLA: ' + sla.targetSla + '\n' +
    'Escalation: ' + (isEscalation ? '🚨 YES' : 'No') + '\n' +
    'Phone: ' + phone + '\n' +
    'Description: ' + (data.description || 'N/A') + '\n' +
    (fileLink ? 'Attachment: ' + fileLink + '\n' : '');
  
  managers.forEach(function(email) {
    try {
      MailApp.sendEmail(email.trim(), subject, body);
    } catch (e) {
      Logger.log('Failed to send email to ' + email + ': ' + e.message);
    }
  });
}

// ==================== MANAGEMENT DASHBOARD ====================

function getManagementData() {
  if (!isManager()) {
    return {
      isManager: false,
      currentUserEmail: getCurrentUserEmail() || '',
      tickets: [],
      summary: { total: 0, escalations: 0, inProgress: 0, resolved: 0 }
    };
  }
  
  var ss = getSpreadsheet_();
  if (!ss) {
    return { isManager: true, currentUserEmail: getCurrentUserEmail() || '', tickets: [], summary: { total: 0, escalations: 0, inProgress: 0, resolved: 0 } };
  }
  
  var sheet = ss.getSheetByName('Submissions');
  if (!sheet || sheet.getLastRow() < 2) {
    return { isManager: true, currentUserEmail: getCurrentUserEmail() || '', tickets: [], summary: { total: 0, escalations: 0, inProgress: 0, resolved: 0 } };
  }
  
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, SUBMISSIONS_HEADERS.length).getValues();
  var now = new Date();
  var tickets = [];
  var summary = { total: 0, escalations: 0, inProgress: 0, resolved: 0 };
  
  values.forEach(function(r, idx) {
    var ticketId = r[COL.TICKET_ID - 1];
    if (!ticketId) return;
    
    var status = r[COL.STATUS - 1] || 'New';
    var timestamp = r[COL.TIMESTAMP - 1];
    var storedFrt = r[COL.FRT_MINS - 1];
    var frtMins;
    
    if (storedFrt !== '' && storedFrt !== null && storedFrt !== undefined && !isNaN(storedFrt)) {
      frtMins = Math.round(Number(storedFrt));
    } else if (timestamp instanceof Date) {
      frtMins = Math.max(0, Math.round((now.getTime() - timestamp.getTime()) / 60000));
    } else {
      frtMins = 0;
    }
    
    var isEscalation = String(r[COL.ESCALATION - 1]).toLowerCase() === 'yes';
    
    summary.total++;
    if (isEscalation) summary.escalations++;
    if (status === 'In Progress') summary.inProgress++;
    if (status === 'Resolved') summary.resolved++;
    
    tickets.push({
      rowIndex: idx + 2,
      timestamp: timestamp instanceof Date ? timestamp.toISOString() : String(timestamp || ''),
      isEscalation: isEscalation,
      targetSla: r[COL.TARGET_SLA - 1] || '',
      assignedTeam: r[COL.ASSIGNED_TEAM - 1] || '',
      agentName: r[COL.AGENT_NAME - 1] || '',
      ticketId: ticketId,
      phone: r[COL.PHONE - 1] || '',
      tool: r[COL.TOOL - 1] || '',
      channelOrClinic: r[COL.CHANNEL_CLINIC - 1] || '',
      serviceOrQueue: r[COL.SERVICE_QUEUE - 1] || '',
      issueSubtype: r[COL.ISSUE_SUBTYPE - 1] || '',
      description: r[COL.DESCRIPTION - 1] || '',
      fileLink: r[COL.FILE_LINK - 1] || '',
      status: status,
      frtMins: frtMins,
      frtIsLive: !(storedFrt !== '' && storedFrt !== null && storedFrt !== undefined && !isNaN(storedFrt)),
      managerNotes: r[COL.MANAGER_NOTES - 1] || '',
      lastModifiedBy: r[COL.LAST_MOD_BY - 1] || '',
      lastModifiedAt: r[COL.LAST_MOD_AT - 1] instanceof Date ? r[COL.LAST_MOD_AT - 1].toISOString() : String(r[COL.LAST_MOD_AT - 1] || '')
    });
  });
  
  tickets.sort(function(a, b) {
    try {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } catch (e) {
      return 0;
    }
  });
  
  return {
    isManager: true,
    currentUserEmail: getCurrentUserEmail() || '',
    tickets: tickets,
    summary: summary
  };
}

function getAgentTickets() {
  var email = getCurrentUserEmail();
  if (!email) return { tickets: [], summary: { total: 0, open: 0, resolved: 0 } };
  
  var ss = getSpreadsheet_();
  if (!ss) return { tickets: [], summary: { total: 0, open: 0, resolved: 0 } };
  
  var sheet = ss.getSheetByName('Submissions');
  if (!sheet || sheet.getLastRow() < 2) {
    return { tickets: [], summary: { total: 0, open: 0, resolved: 0 } };
  }
  
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, SUBMISSIONS_HEADERS.length).getValues();
  var tickets = [];
  var summary = { total: 0, open: 0, resolved: 0 };
  
  values.forEach(function(r, idx) {
    var ticketId = r[COL.TICKET_ID - 1];
    var agentEmail = r[COL.EMAIL - 1];
    if (!ticketId || !agentEmail || agentEmail.toLowerCase() !== email.toLowerCase()) return;
    
    var status = r[COL.STATUS - 1] || 'New';
    var timestamp = r[COL.TIMESTAMP - 1];
    
    summary.total++;
    if (status === 'New' || status === 'In Progress') summary.open++;
    if (status === 'Resolved') summary.resolved++;
    
    tickets.push({
      rowIndex: idx + 2,
      timestamp: timestamp instanceof Date ? timestamp.toISOString() : String(timestamp || ''),
      isEscalation: String(r[COL.ESCALATION - 1]).toLowerCase() === 'yes',
      ticketId: ticketId,
      tool: r[COL.TOOL - 1] || '',
      issueSubtype: r[COL.ISSUE_SUBTYPE - 1] || '',
      status: status,
      managerNotes: r[COL.MANAGER_NOTES - 1] || ''
    });
  });
  
  tickets.sort(function(a, b) {
    try {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } catch (e) {
      return 0;
    }
  });
  
  return { tickets: tickets, summary: summary };
}

function getAgentDashboardData() {
  var userEmail = getCurrentUserEmail() || '';
  
  var ticketData = getAgentTickets();
  var contacts = getContacts();
  var services = getServices();
  var discounts = getDiscounts();
  var calendarEvents = getCalendarEvents();
  var suggestions = getSuggestions();
  var config = getInitialData();
  
  return {
    userEmail: userEmail,
    isManager: isManager(),
    tickets: ticketData,
    contacts: contacts,
    services: services,
    discounts: discounts,
    calendarEvents: calendarEvents,
    suggestions: suggestions,
    config: config
  };
}

function updateTicketStatus(rowIndex, newStatus, managerNote) {
  if (!isManager()) {
    throw new Error('Access restricted: you are not a manager.');
  }
  return updateSingleTicket(rowIndex, newStatus, managerNote);
}

function bulkUpdateTickets(rowIndices, newStatus, managerNote) {
  if (!isManager()) {
    throw new Error('Access restricted: you are not a manager.');
  }
  
  var results = {
    success: [],
    failed: []
  };
  
  (rowIndices || []).forEach(function(rowIndex) {
    try {
      var result = updateSingleTicket(rowIndex, newStatus, managerNote);
      results.success.push(result);
    } catch (e) {
      results.failed.push({ rowIndex: rowIndex, error: e.message });
    }
  });
  
  return results;
}

function updateSingleTicket(rowIndex, newStatus, managerNote) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = getSpreadsheet_();
    if (!ss) throw new Error('Cannot access spreadsheet.');

    var sheet = ss.getSheetByName('Submissions');
    if (!sheet) throw new Error('Submissions sheet not found.');

    rowIndex = Number(rowIndex);
    if (!rowIndex || rowIndex < 2 || rowIndex > sheet.getLastRow()) {
      throw new Error('Invalid ticket row: ' + rowIndex);
    }

    var range = sheet.getRange(rowIndex, 1, 1, SUBMISSIONS_HEADERS.length);
    var rowValues = range.getValues()[0];
    var ticketId = rowValues[COL.TICKET_ID - 1] || '';
    var oldStatus = rowValues[COL.STATUS - 1] || 'New';
    var timestamp = rowValues[COL.TIMESTAMP - 1];
    var email = getCurrentUserEmail() || '';
    var now = new Date();

    var existingFrt = rowValues[COL.FRT_MINS - 1];
    if ((existingFrt === '' || existingFrt === null || existingFrt === undefined) &&
        oldStatus === 'New' && newStatus !== 'New' && timestamp instanceof Date) {
      var frt = Math.max(0, Math.round((now.getTime() - timestamp.getTime()) / 60000));
      sheet.getRange(rowIndex, COL.FRT_MINS).setValue(frt);
    }

    if (newStatus) {
      sheet.getRange(rowIndex, COL.STATUS).setValue(newStatus);
    }

    if (managerNote && String(managerNote).trim()) {
      var prevNote = rowValues[COL.MANAGER_NOTES - 1] || '';
      var stamped = '[' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd-MMM HH:mm') + ' · ' + email + '] ' + String(managerNote).trim();
      var combinedNote = prevNote ? (prevNote + '\n' + stamped) : stamped;
      sheet.getRange(rowIndex, COL.MANAGER_NOTES).setValue(combinedNote);
    }

    sheet.getRange(rowIndex, COL.LAST_MOD_BY).setValue(email);
    sheet.getRange(rowIndex, COL.LAST_MOD_AT).setValue(now);

    var auditSheet = ss.getSheetByName('AuditLog');
    if (!auditSheet) {
      auditSheet = ss.insertSheet('AuditLog');
      ensureHeaders(auditSheet, AUDIT_HEADERS);
    }
    auditSheet.appendRow([now, rowIndex, ticketId, oldStatus, newStatus || oldStatus, managerNote || '', email]);

    return {
      success: true,
      rowIndex: rowIndex,
      ticketId: ticketId,
      newStatus: newStatus || oldStatus
    };
  } finally {
    lock.releaseLock();
  }
}

// ==================== NUCLEAR RESET ====================

function nuclearReset() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create('Clinic Issue Log - NEW');
      Logger.log('📊 Created new spreadsheet: ' + ss.getUrl());
    }
    
    // Delete ALL existing sheets except the first one
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      if (sheet.getName() !== 'Sheet1') {
        ss.deleteSheet(sheet);
      }
    }
    
    // Get Sheet1 and rename it to Config
    var configSheet = ss.getSheetByName('Sheet1');
    if (configSheet) {
      configSheet.setName('Config');
    } else {
      configSheet = ss.insertSheet('Config');
    }
    
    // ============================================================
    // CREATE CONFIG SHEET
    // ============================================================
    configSheet.clear();
    configSheet.getRange(1, 1, 1, 5).setValues([['Type', 'Key1', 'Key2', 'Value', 'SortOrder']]);
    configSheet.setFrozenRows(1);
    
    var rows = [];
    
    // AGENTS
    ['Ajay Nambiar', 'Priya Sharma', 'Rohit Verma', 'Sneha Iyer', 'Karthik Rao'].forEach(function(name, i) {
      rows.push(['Agent', name, '', '', i + 1]);
    });
    
    // MANAGER EMAILS
    var activeEmail = Session.getActiveUser().getEmail();
    if (activeEmail && activeEmail !== '') {
      rows.push(['ManagerEmail', activeEmail, '', '', 1]);
    }
    rows.push(['ManagerEmail', 'manager@supertails.com', '', '', 2]);
    
    // TOOLS
    rows.push(['Tool', 'PawCare', 'PawCare', '🐾', 1]);
    rows.push(['Tool', 'Nugget', 'Nugget', '📋', 2]);
    rows.push(['Tool', 'Ameyo', 'Ameyo', '📞', 3]);
    rows.push(['Tool', 'Ticket', 'Ticket', '🎫', 4]);
    rows.push(['Tool', 'ClinicOps', 'Clinic Ops', '🏥', 5]);
    
    // CHANNELS
    ['Clinic IB', 'Clinic OB New Leads', 'Clinic OB Existing', 'Confirmation Calling'].forEach(function(name, i) {
      rows.push(['Channel', 'Ticket', name, '', i + 1]);
    });
    ['Login / Access', 'App Sync Issue', 'App Crash / Freeze', 'Other'].forEach(function(name, i) {
      rows.push(['Channel', 'PawCare', name, '', i + 1]);
    });
    
    // CLINICS
    [
      'Koramangala', 'Banashankari', 'Brookfield', 'Bannerghatta', 'Kalyan Nagar',
      'KR Puram', 'Whitefield', 'Hosur Road', 'RT Nagar', 'RMV', 'Rajajinagar', 'Indiranagar'
    ].forEach(function(name, i) {
      rows.push(['Clinic', name, '', '', i + 1]);
    });
    
    // SERVICES
    ['Vet Consultation', 'Vaccination', 'Grooming', 'Diagnostics'].forEach(function(name, i) {
      rows.push(['Service', 'ClinicOps', name, '', i + 1]);
    });
    
    // ISSUES
    var issueMap = {
      'Nugget': [
        'Inbound call received but no ticket created',
        'Not able to dispose the ticket',
        'Auto-merging of tickets not working'
      ],
      'Ameyo': [
        'Not able to make outbound calls',
        'Not able to use AUX',
        'Applied AUX but automatically came online',
        'Not able to dispose the call',
        'Not able to login to Ameyo'
      ],
      'PawCare|Login / Access': [
        'Unable to login to PawCare',
        'OTP not received',
        'Account locked'
      ],
      'PawCare|App Sync Issue': [
        'Appointment not syncing',
        'Customer data mismatch',
        'Payment status not updated'
      ],
      'PawCare|App Crash / Freeze': [
        'App crashes on opening',
        'App freezes during booking',
        'App crashes while uploading file'
      ],
      'PawCare|Other': [
        'Other issue not listed above'
      ],
      'Ticket|Clinic IB': [
        'Phone number not updated in the ticket',
        'Wrong ticket created',
        'Duplicate ticket created under same customer',
        'Customer already booked but ABC ticket created',
        'Customer already visited but No-Show ticket created',
        'Customer cancelled appointment but No-Show ticket created',
        'Customer rescheduled appointment but No-Show ticket created',
        'Incorrect follow-up ticket created'
      ],
      'Ticket|Clinic OB New Leads': [
        'Lead not updated after call',
        'Wrong disposition selected',
        'Duplicate lead ticket created'
      ],
      'Ticket|Clinic OB Existing': [
        'Existing customer ticket not linked',
        'Follow-up ticket missing',
        'Wrong status updated on ticket'
      ],
      'Ticket|Confirmation Calling': [
        'Confirmation call not logged',
        'Wrong appointment confirmed',
        'Ticket not closed after confirmation'
      ],
      'ClinicOps|Vet Consultation': [
        'Long waiting time at clinic',
        'Groomer took leave — appointment cancelled',
        'Roster not updated — slots not showing in PawCare',
        'Clinic cancelled appointment without informing customer',
        'Customer visited but invoice not generated',
        'Bad service experience reported by customer'
      ],
      'ClinicOps|Vaccination': [
        'Vaccine stock not available',
        'Appointment slot not showing',
        'Wrong vaccine schedule updated'
      ],
      'ClinicOps|Grooming': [
        'Groomer unavailable',
        'Grooming package not updated correctly',
        'Customer complaint about service quality'
      ],
      'ClinicOps|Diagnostics': [
        'Lab report delayed',
        'Sample collection missed',
        'Incorrect report shared with customer'
      ]
    };
    
    Object.keys(issueMap).forEach(function(pathKey) {
      issueMap[pathKey].forEach(function(issueText, i) {
        rows.push(['Issue', pathKey, '', issueText, i + 1]);
      });
    });
    
    // Write all rows
    if (rows.length) {
      configSheet.getRange(2, 1, rows.length, 5).setValues(rows);
    }
    
    Logger.log('✅ Config sheet created with ' + rows.length + ' rows');
    
    // ============================================================
    // CREATE SUBMISSIONS SHEET
    // ============================================================
    var subSheet = ss.insertSheet('Submissions');
    var subHeaders = [
      'Timestamp', 'Logged-in Email', 'Is Escalation?', 'Target SLA', 'Assigned Team',
      'Agent Name', 'Ticket ID', 'Customer Phone', 'Category / Tool', 'Channel / Clinic',
      'Service / Queue', 'Issue Subtype', 'Description', 'File Link', 'Status',
      'FRT (Mins)', 'Manager Notes', 'Last Modified By', 'Last Modified At'
    ];
    subSheet.getRange(1, 1, 1, subHeaders.length).setValues([subHeaders]);
    subSheet.setFrozenRows(1);
    Logger.log('✅ Submissions sheet created');
    
    // ============================================================
    // CREATE AUDIT LOG SHEET
    // ============================================================
    var auditSheet = ss.insertSheet('AuditLog');
    var auditHeaders = ['Timestamp', 'Row Index', 'Ticket ID', 'Old Status', 'New Status', 'Manager Note', 'Modified By'];
    auditSheet.getRange(1, 1, 1, auditHeaders.length).setValues([auditHeaders]);
    auditSheet.setFrozenRows(1);
    Logger.log('✅ AuditLog sheet created');
    
    // ============================================================
    // CREATE SUGGESTIONS SHEET
    // ============================================================
    var suggSheet = ss.insertSheet('Suggestions');
    var suggHeaders = ['Timestamp', 'Agent Name', 'Category / Tool', 'Description', 'Status', 'Admin Note'];
    suggSheet.getRange(1, 1, 1, suggHeaders.length).setValues([suggHeaders]);
    suggSheet.setFrozenRows(1);
    Logger.log('✅ Suggestions sheet created');
    
    // ============================================================
    // CREATE CONTACTS SHEET
    // ============================================================
    var contactsSheet = ss.insertSheet('Contacts');
    var contactsHeaders = ['Type', 'Name', 'Email', 'Phone', 'Role', 'Team', 'SortOrder'];
    contactsSheet.getRange(1, 1, 1, contactsHeaders.length).setValues([contactsHeaders]);
    contactsSheet.setFrozenRows(1);
    var contacts = [
      ['Tech', 'Rajesh Kumar', 'rajesh@supertails.com', '9876543210', 'Team Lead', 'Product/Tech', 1],
      ['Tech', 'Priya Singh', 'priya@supertails.com', '9876543211', 'Senior Developer', 'Product/Tech', 2],
      ['CRM', 'Amit Patel', 'amit@supertails.com', '9876543212', 'CRM Manager', 'CRM', 1],
      ['Telephony', 'Sneha Reddy', 'sneha@supertails.com', '9876543213', 'Telephony Lead', 'Telephony', 1],
      ['Clinic', 'Dr. Vikram', 'vikram@supertails.com', '9876543214', 'Clinic Manager', 'ClinicOps', 1],
      ['Escalation', 'Manager', 'manager@supertails.com', '9876543215', 'Escalation Contact', 'Management', 1]
    ];
    contactsSheet.getRange(2, 1, contacts.length, contactsHeaders.length).setValues(contacts);
    Logger.log('✅ Contacts sheet created');
    
    // ============================================================
    // CREATE SERVICES SHEET
    // ============================================================
    var servicesSheet = ss.insertSheet('Services');
    var servicesHeaders = ['Service', 'Description', 'Price', 'DiscountEligible', 'SortOrder'];
    servicesSheet.getRange(1, 1, 1, servicesHeaders.length).setValues([servicesHeaders]);
    servicesSheet.setFrozenRows(1);
    var services = [
      ['Vet Consultation', 'Professional veterinary consultation', '500', 'Yes', 1],
      ['Vaccination', 'Pet vaccination services', '800', 'Yes', 2],
      ['Grooming', 'Professional pet grooming', '1200', 'Yes', 3],
      ['Diagnostics', 'Pet diagnostic services', '1500', 'No', 4]
    ];
    servicesSheet.getRange(2, 1, services.length, servicesHeaders.length).setValues(services);
    Logger.log('✅ Services sheet created');
    
    // ============================================================
    // CREATE DISCOUNTS SHEET
    // ============================================================
    var discountsSheet = ss.insertSheet('Discounts');
    var discountsHeaders = ['Code', 'Description', 'DiscountPercent', 'ValidUntil', 'ApplicableServices', 'SortOrder'];
    discountsSheet.getRange(1, 1, 1, discountsHeaders.length).setValues([discountsHeaders]);
    discountsSheet.setFrozenRows(1);
    var discounts = [
      ['WELCOME10', 'First visit welcome discount', '10', '2025-12-31', 'All', 1],
      ['REFER20', 'Referral discount', '20', '2025-12-31', 'All', 2],
      ['CLINIC15', 'Clinic partnership discount', '15', '2025-06-30', 'Vet Consultation,Diagnostics', 3]
    ];
    discountsSheet.getRange(2, 1, discounts.length, discountsHeaders.length).setValues(discounts);
    Logger.log('✅ Discounts sheet created');
    
    // ============================================================
    // CREATE CALENDAR SHEET
    // ============================================================
    var calendarSheet = ss.insertSheet('Calendar');
    var calendarHeaders = ['Date', 'Time', 'Event', 'Attendees', 'Type', 'SortOrder'];
    calendarSheet.getRange(1, 1, 1, calendarHeaders.length).setValues([calendarHeaders]);
    calendarSheet.setFrozenRows(1);
    var today = new Date();
    var events = [
      [formatDate(today), '10:00', 'Team Meeting', 'All Team', 'Meeting', 1],
      [formatDate(addDays(today, 1)), '14:00', 'Tech Sync', 'Tech Team', 'Meeting', 2],
      [formatDate(addDays(today, 2)), '11:00', 'Manager Review', 'Managers', 'Review', 3]
    ];
    calendarSheet.getRange(2, 1, events.length, calendarHeaders.length).setValues(events);
    Logger.log('✅ Calendar sheet created');
    
    // ============================================================
    // FINAL SUMMARY
    // ============================================================
    var sheetNames = ss.getSheets().map(function(s) { return s.getName(); });
    Logger.log('📊 All sheets created: ' + sheetNames.join(', '));
    Logger.log('📊 Spreadsheet URL: ' + ss.getUrl());
    
    return {
      success: true,
      message: '✅ All sheets created successfully!',
      sheetNames: sheetNames,
      spreadsheetUrl: ss.getUrl(),
      configRows: rows.length
    };
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    return {
      success: false,
      message: '❌ Error: ' + error.message
    };
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatDate(date) {
  var d = new Date(date);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}