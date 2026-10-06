**Bark — Complete Project Documentation**
1. Overview
Bark is a fully serverless internal web application built on Google Apps Script (backend) and Google Sheets (database), rendered through HtmlService as two modern single-page interfaces. It gives customer support and inside-sales agents at a pet healthcare clinic a structured, real-time way to report operational issues — and gives team leads and managers the visibility they need to triage, escalate, and measure performance.

There is no external server, no paid hosting, no third-party database, and no separate login system. Everything runs on Google Workspace, authenticated automatically by the user's Google account, at zero infrastructure cost.

Originally scoped as a simple issue-logging form, Bark has grown into a full operations toolkit: an agent-facing submission portal, a manager dashboard with live SLA tracking and analytics, a config-driven taxonomy system, an audit trail, and an expanding set of productivity features (Booking Tracker, Preset Notes, Universal Search).

2. The Problem It Solves
Before Bark, issue reporting at the clinic was fragmented across chat, email, and ad-hoc spreadsheets. That created six recurring problems:

No structure — Issues arrived as free-text messages with no consistent categorization, making trends impossible to spot.

No accountability — Nobody could tell who logged what, when, or whether it had been acted on.

No priority system — A critical clinic outage looked the same as a cosmetic UI bug.

No SLA visibility — Managers had no way to know if tickets were breaching their targets.

No audit trail — Status changes happened silently, and no one could reconstruct the history of a ticket.

No analytics — Questions like "which tool breaks most often?" or "who is overloaded?" could not be answered.

Bark replaces all of this with a single, configurable, self-documenting workflow.

3. Who Uses It
3.1 Agents (Inside Sales / Support)
The front-line users. They log issues the moment they occur, attach evidence, track their own pending tickets, browse services, discounts, contacts, and calendar events, and submit improvement suggestions.

3.2 Team Leads
Oversee a group of agents. They use the management dashboard to monitor incoming volume, triage escalations, update ticket statuses, and add manager notes.

3.3 Managers
Own the SLA and performance picture. They review breaches, agent resolution rates, escalation trends, and audit logs, and they configure the entire taxonomy (tools, channels, clinics, services, issues, agents) via the Config sheet without touching code.

3.4 Administrator (implicit)
The Google account that owns the spreadsheet. Can run nuclearReset() to rebuild the entire data store from scratch with seed defaults.

4. Core Features — Agent Side
4.1 Guided Issue Logging
The primary form is a config-driven, drill-down wizard that guarantees every ticket is categorized correctly before submission:

Ticket ID (required, alphanumeric, auto-uppercased, spaces stripped)

Customer Phone (required, 10 digits, numeric-only enforced)

Agent Name (required, dropdown populated from the Config sheet)

Tool / Area (required, visual card grid — see 4.2)

Escalation toggle (optional, triggers priority SLA calculation)

Dynamic sub-fields based on selected tool (see 4.3)

Free-text description (optional, but auto-forwarded to Suggestions sheet)

File attachment (optional, up to 20MB — screenshots, screen recordings, pasted clipboard images)

Every submission is validated client-side and again server-side before writing.

4.2 Tool Selection Grid
Five tool cards, each with an icon and label, sourced from the Config sheet:

Tool	Icon	Assigned Team
PawCare	🐾	Product / Tech Team
Nugget	📋	CRM Team
Ameyo	📞	Telephony Team
Ticket	🎫	Ticketing Ops Team
Clinic Ops	🏥	Clinic Operations Team
4.3 Dynamic Sub-Fields per Tool
Selecting a tool renders context-appropriate inputs, all sourced from Config:

PawCare → Channel dropdown (Login/Access, App Sync Issue, App Crash/Freeze, Other) → then a drill-down issue dropdown per channel

Nugget / Ameyo → Single issue dropdown

Ticket → Channel pill buttons (Clinic IB, Clinic OB New Leads, Clinic OB Existing, Confirmation Calling) → issue dropdown per channel

Clinic Ops → Clinic dropdown (12 Bengaluru locations) → Service dropdown (Vet Consultation, Vaccination, Grooming, Diagnostics) → issue dropdown per clinic-service pair

Dropdowns are rendered with TomSelect for search/filter capability on long lists.

4.4 Attachment Handling
Click-to-upload or drag-and-drop

Clipboard paste support (paste a screenshot directly)

20MB size guard

Files uploaded to a Google Drive folder named "Clinic Issue Log Uploads"

Shareable link written back to the Submissions sheet's File Link column

Permission set to "Anyone with link — View" for internal access

4.5 Draft Autosave
The form's state is persisted to localStorage under clinicIssueLog_draft after every change, so an accidental refresh doesn't wipe a partially filled form.

4.6 Recent Submissions Drawer
A collapsible panel at the bottom of the issues page lists the agent's last 5 submissions this session, sourced from localStorage key clinicIssueLog_recent.

4.7 Sidebar Resources
Pending Tickets — the agent's own open tickets (status: New or In Progress)

Services & Discounts — catalog with prices, eligibility flags, discount codes, expiry dates

Point of Contacts — team-grouped contact directory (Tech, CRM, Telephony, Clinic, Escalation) with email/phone

Calendar — upcoming team events, meetings, reviews

Suggestions — an open channel for agents to propose improvements; managers update status

4.8 Keyboard Shortcuts
Ctrl / Cmd + Enter — submit form

Ctrl / Cmd + F — focus search input

Esc — clear error / close modal

n — jump to new-issue form

d — jump to manager dashboard (if user has access)

Ctrl / Cmd + K — focus universal search (planned)

5. Core Features — Manager Dashboard
Accessible via ?page=management and gated by an email check against the Config sheet's ManagerEmail rows.

5.1 Live Metric Strip
Four cards across the top:

Total Issues

Escalations 🚨

In Progress 🟡

Resolved 🟢

Refreshed automatically every 60 seconds.

5.2 Interactive Charts (Chart.js 4.4.0)
Issues by Tool — pie chart

Status Distribution — doughnut chart (New / In Progress / Resolved)

Escalation Trends (7 Days) — bar chart

Top Agents — horizontal bar chart of ticket volume

Charts re-render on theme toggle to match dark/light colors.

5.3 Ticket Table
The main workspace — a filterable, sortable, bulk-editable table with columns:

Column	Content
Checkbox	Row selection for bulk actions
Ticket / Time	Ticket ID, relative time, phone
Agent	Agent name
Tool / Detail	Tool + channel/service
Issue	Sub-issue + description preview
Escalation	🚨 badge if escalated
FRT	First Response Time (live for open tickets)
Status	Inline dropdown (New / In Progress / Resolved)
Manager Notes	Preview + inline note input
File	Link to attachment if any
5.4 Filters
Quick pills: All / Escalations / Open Only / Clinic Ops

Advanced: Date range (from/to), Tool, Status, Priority (P1/P2/P3/Standard)

Free-text search: matches Ticket ID, Phone, Agent, Issue, Description

5.5 Bulk Update Bar
Selecting multiple rows reveals a bulk-action bar. Managers can set a new status and append a stamped manager note to all selected tickets in one action.

5.6 SLA Dashboard
SLA Compliance % — resolved / total

Breached Tickets — open tickets past their target SLA

Approaching Deadline — open tickets within 30 minutes of breach

Lists both groups with ticket ID, agent, tool, and elapsed time

5.7 Team Performance
Per-agent table with:

Total tickets logged

Resolved count

Escalation count

Average FRT

Resolution rate (color-coded: green ≥80%, amber 50–79%, red <50%)

5.8 Audit Log
Every status change and manager note appends a row to the AuditLog sheet:
Timestamp | Row Index | Ticket ID | Old Status | New Status | Manager Note | Modified By

5.9 Reports
Four CSV export cards: Summary, SLA, Team Performance, Audit Log.

5.10 Configuration Viewer
Read-only panel showing current Agents, Manager emails, Tools, and Issues — everything sourced live from the Config sheet. Refresh button re-fetches.

6. SLA Logic
Every ticket is assigned a priority and target SLA at submission time:

Condition	Priority	Target SLA
Not escalated (default)	Standard	24 Hours
Escalated + Clinic Ops	P1	30 Minutes
Escalated + PawCare or Ameyo	P2	1 Hour
Escalated + any other tool	P3	2 Hours
The FRT (First Response Time) column starts as "live" for open tickets and freezes to a fixed value the moment the ticket moves off status New.

7. Technical Architecture
7.1 Stack
Layer	Technology
Backend	Google Apps Script (.gs)
Database	Google Sheets (single spreadsheet, multi-tab)
Frontend	HtmlService + inline HTML/CSS/JS
Styling	Custom CSS with variables + Tailwind CDN (utility classes)
Charts	Chart.js 4.4.0 (CDN)
Dropdowns	TomSelect 2.3.1 (CDN)
File storage	Google Drive (auto-created folder)
Auth	Google account (Session.getActiveUser)
7.2 Routing
doGet(e) inspects e.parameter.page:

management → renders Management.html

anything else → renders Index.html

Both templates are evaluated with viewport meta and X-Frame options for iframe embedding.

7.3 Concurrency Safety
All write operations (log ticket, update status, bulk update, add booking) are wrapped in:

javascript
var lock = LockService.getScriptLock();
lock.waitLock(30000);
try { /* write */ } finally { lock.releaseLock(); }
This prevents two agents from corrupting the same sheet row when writing simultaneously.

7.4 Email Notifications
On every submission, sendNotifications() emails all ManagerEmail entries (excluding a placeholder) with a subject prefix based on priority:

P1 → 🚨 URGENT - ...

Escalation → ⚠️ ...

Default → 🔔 ...

The function checks MailApp.getRemainingDailyQuota() before sending to avoid silent failures.

7.5 Auto-Initialization
Every doGet runs initDatastore(), which:

Ensures all required sheets exist

Ensures headers are set (frozen row 1)

Seeds Config, Contacts, Services, Discounts, Calendar if empty

Deletes the default Sheet1 if untouched

This makes the app self-bootstrapping — a fresh copy of the spreadsheet is functional on first load.

8. Data Model
8.1 Submissions (19 columns)
Timestamp, Logged-in Email, Is Escalation?, Target SLA, Assigned Team, Agent Name, Ticket ID, Customer Phone, Category/Tool, Channel/Clinic, Service/Queue, Issue Subtype, Description, File Link, Status, FRT (Mins), Manager Notes, Last Modified By, Last Modified At

8.2 Config (5 columns, drives everything)
Type, Key1, Key2, Value, SortOrder

Types used:

Agent — agent display names

ManagerEmail — manager Google accounts

Tool — tool id, display label, icon

Channel — keyed by tool

Clinic — Bengaluru clinic locations

Service — keyed by tool (only ClinicOps currently)

Issue — keyed by tool|channel path

8.3 AuditLog
Timestamp, Row Index, Ticket ID, Old Status, New Status, Manager Note, Modified By

8.4 Suggestions
Timestamp, Agent Name, Category/Tool, Description, Status, Admin Note

8.5 Contacts
Type, Name, Email, Phone, Role, Team, SortOrder

8.6 Services
Service, Description, Price, DiscountEligible, SortOrder

8.7 Discounts
Code, Description, DiscountPercent, ValidUntil, ApplicableServices, SortOrder

8.8 Calendar
Date, Time, Event, Attendees, Type, SortOrder

8.9 Planned New Sheets
Bookings — Timestamp, Appointment ID, Agent Name, Customer Name, Phone, Status, MonthKey

Targets — Agent Name, Month, Target

MasterAppointments — Appointment ID, Customer Name, Phone

PresetNotes — Category, Title, Note Text, Sort Order

9. Config-Driven Design
The single most powerful architectural decision: nothing is hardcoded. Adding a new agent, tool, channel, clinic, service, or issue sub-type requires only editing a row in the Config sheet. The frontend dropdowns, drill-downs, and even the SLA priority mapping pick up changes automatically on next page load.

This means the tool can be re-branded, re-scoped, or extended to a different vertical in minutes — without touching JavaScript.

10. Security & Access Control
Identity: Google Workspace handles authentication. Session.getActiveUser().getEmail() returns the logged-in user's email.

Role gating: isManager() checks the current email against ManagerEmail rows in Config. The Management route returns an "Access Restricted" HTML page if the check fails.

No open writes: All backend functions validate their inputs and role-check where needed.

Drive permissions: Uploaded files are set to "Anyone with link — View" but only the link is surfaced; the folder itself is private to the app owner.

Audit trail: Every status change is permanently logged.

11. Design System
11.1 Theme System
CSS variables drive both light and dark themes. Dark mode toggles via a [data-theme="dark"] attribute on <html> and is persisted in localStorage under clinicIssueLog_theme. If no preference exists, the system preference (prefers-color-scheme) is honored.

11.2 Core Tokens
Backgrounds: --bg-body, --bg-header, --bg-sidebar, --bg-card, --bg-input, --bg-hover

Text: --text-primary, --text-secondary, --text-muted

Borders: --border-light, --border-medium

Brand: --color-primary (#0f5132), --color-primary-light, --color-primary-bg

Status: --color-success, --color-warning, --color-error, --color-info (+ -bg variants)

Shadows: --shadow-sm, --shadow-md, --shadow-lg

11.3 Layout
Sidebar: 260px fixed, slide-off on mobile below 768px

Header: dark green bar with hamburger, page title, live status dot, shortcuts help button

Main content: fluid, padded, responsive grid layouts

Scrollbars: custom-styled to match theme

11.4 Accessibility
Focus-visible outlines on all interactive elements

prefers-reduced-motion honored — all transitions collapsed to 0.01ms when requested

Semantic HTML where possible; ARIA labels on icons and inputs

Keyboard-navigable throughout

12. Planned Features (In Active Development)
12.1 Booking Tracker
A two-column page where agents paste an Appointment ID to log a booking, while seeing their own month-to-date performance against a manager-set target. Includes an SVG progress ring, breakdown stats (today/week/MTD), color-coded target card, and a personal ranking against the team.

12.2 Preset Notes Library
A searchable, category-filtered library of pre-written response templates. One-click copy to clipboard. Supports {Placeholder} tokens that trigger a small inline modal for personalization before copying.

12.3 Universal Search Bar
A Ctrl+K command palette in the header of both HTML files that searches Submissions, Bookings, and Preset Notes in real time. Smart query parsing (5-digit → Ticket ID, 10-digit → phone, @name → agent, #id → exact, >term → notes, book term → bookings) and keyboard-first navigation.

13. Impact
Bark transformed an unstructured, high-friction reporting process into a fast, accountable, data-driven workflow. Key outcomes:

Instant visibility — managers see escalations and SLA breaches the moment they happen, not days later

Zero cost — no hosting, no database, no licensing; runs entirely inside the Google account the team already pays for

Consistency — every ticket is categorized identically, making reports reliable

Accountability — every action is timestamped and attributed

Extensibility — the config-driven design lets the tool grow with the team without engineering effort

Proof of concept — demonstrates that Google Apps Script can power genuine production software, not just scripts and add-ons

Bark is a case study in doing more with less: a lean stack, a sharp focus on workflow, and a design discipline usually reserved for paid SaaS products — all built and maintained by a small internal team.

