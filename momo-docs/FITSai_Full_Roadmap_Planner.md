# FITSai Development Roadmap — Full Project Planner

**Generated:** 2 March 2026
**Project:** FITSai (F.E.L.I.C.I.A.) — Friendly Intelligent Technical Support AI
**Server:** 10.0.0.231 (Ubuntu 24.04 LTS)
**Stack:** FastAPI + React + PostgreSQL + ChromaDB + Ollama + GPT-5.2

---

## Executive Summary

FITSai has **97 completed features** since February 2026. This document covers all **pending work** across 8 categories, with time estimates, dependencies, and a suggested build order.

**Total estimated effort:** 47-74 working days (~10-15 weeks)

| Category | Items | Estimate |
|----------|-------|----------|
| High Priority (Security & Core UX) | 2 | 3-5 days |
| Medium Priority (Productivity) | 2 | 6-10 days |
| Improvements | 2 | 2-4 days |
| Document Management System | 7 | 13-19 days |
| Nice to Have (Integration) | 3 | 10-17 days |
| User Suggestions | 1 | 1-2 days |
| White-Label Chatbot Platform | 17 | 30-50 days |
| Future / If Needed | 1 | 3-5 days |

---

## Priority 1: Quick Wins & High Priority

These can be done first — small effort, big impact.

---

### 1.1 Windows CLI Installer
**Category:** High Priority | **Estimate:** 1-2 days | **Dependencies:** None

**What:** Package the FITSai CLI (currently Linux only) as a Windows .exe using PyInstaller.

**Technical details:**
- Source: `/home/felicia/felicia-mvp/fitsai-cli/`
- Use PyInstaller with `--onefile` flag
- Bundle Python runtime + all dependencies
- Test on Windows 10/11
- Create installer or distribute as single .exe
- Add download link to God Mode panel (currently shows Linux/Debian only)

**Deliverables:**
- `fitsai.exe` downloadable from God Mode
- Installation instructions for Windows users
- Test: `fitsai.exe login` → `fitsai.exe chat "hello"`

---

### 1.2 Two-Factor Authentication (2FA)
**Category:** High Priority | **Estimate:** 2-3 days | **Dependencies:** None

**What:** Add TOTP-based 2FA using Google Authenticator / Authy.

**Technical details:**
- Backend: `pyotp` library for TOTP generation/verification
- New DB fields: `user.totp_secret`, `user.totp_enabled`
- Endpoints: `/api/auth/2fa/setup` (returns QR code), `/api/auth/2fa/verify`, `/api/auth/2fa/disable`
- Frontend: Settings > Security tab — QR code display, verification input
- Login flow: after password check, if 2FA enabled, show TOTP input screen
- Recovery codes: generate 10 one-time codes at setup, store hashed in DB

**Deliverables:**
- QR code setup flow in Settings
- TOTP verification on login
- Recovery codes for lost device
- Admin can reset a user's 2FA in God Mode

---

### 1.3 Scheduled Reports
**Category:** Improvements | **Estimate:** 1-2 days | **Dependencies:** Health Monitoring (done), SMTP config (done)

**What:** Weekly email digest with system stats, usage, and AI performance.

**Technical details:**
- APScheduler job running every Monday 7am SAST
- Queries: total questions this week, per-user breakdown, model usage (GPT vs local), top topics, thumbs up/down ratio, budget spent
- HTML email template (responsive, looks good in Outlook/Gmail)
- Uses existing SMTP config from God Mode Health Alerts
- Admin toggle: enable/disable, change schedule, choose recipients

**Deliverables:**
- Weekly email with stats dashboard
- Config in God Mode: schedule, recipients, toggle

---

### 1.4 PWA Mobile Wrapper (Phase 1)
**Category:** Improvements | **Estimate:** 1-2 days | **Dependencies:** Mobile Responsive UI (done)

**What:** Turn the existing React web app into a Progressive Web App so field techs can "install" it on their phone.

**Technical details:**
- Add `manifest.json` with app name, icons, theme colour, display: standalone
- Add service worker for offline caching (static assets, last-used pages)
- Register for Web Push API notifications
- Camera access already works via browser (document upload feature)
- Voice input via Web Speech API (browser-native)
- Test "Add to Home Screen" on Android Chrome and iOS Safari

**Deliverables:**
- PWA installable from browser
- Offline fallback page
- Push notification support
- App icon on phone home screen

---

### 1.5 CLI Interface on the UI
**Category:** User Suggestions | **Estimate:** 1-2 days | **Dependencies:** FITSai CLI (done)

**What:** User suggested exposing the CLI experience within the web UI.

**Technical details:**
- Terminal-style component in the web UI (xterm.js or similar)
- WebSocket connection to backend
- Restricted command set (no bash/system commands — only FITSai CLI commands)
- Same auth as web UI (JWT token)

**Deliverables:**
- Terminal panel accessible from the UI
- Runs FITSai CLI commands (chat, sessions, etc.)

---

## Priority 2: Medium Priority (Productivity)

These require external service integration (OAuth) — more setup but high value.

---

### 2.1 Email Integration
**Category:** Medium Priority | **Estimate:** 3-5 days | **Dependencies:** None

**What:** Read and send emails through FITSai via OAuth (Gmail, Outlook).

**Technical details:**
- Gmail: Google OAuth 2.0 + Gmail API (`google-api-python-client`)
- Outlook: Microsoft Graph API + MSAL (`msal` library)
- OAuth flow: Settings > Integrations > "Connect Gmail" / "Connect Outlook"
- Store refresh tokens encrypted in DB (per user)
- Features: list recent emails, read specific email, compose/send email, reply to email
- Chat integration: "Show me my last 5 emails", "Reply to the email from John saying I'll be there"
- Privacy: emails are NOT stored in our DB — fetched on demand via API

**Deliverables:**
- Gmail OAuth connection flow
- Outlook OAuth connection flow
- Chat commands for reading/sending emails
- Email summary in morning briefing

---

### 2.2 Calendar Integration
**Category:** Medium Priority | **Estimate:** 3-5 days | **Dependencies:** Email Integration (shares OAuth setup)

**What:** Check availability, create events, get reminders for upcoming meetings.

**Technical details:**
- Google Calendar API / Microsoft Graph Calendar API
- Reuse OAuth tokens from email integration
- Features: list today's events, check availability for a time slot, create new event, RSVP
- Chat integration: "What's on my calendar today?", "Schedule a meeting with Thabo at 2pm tomorrow"
- Integration with morning briefing: show today's schedule
- Conflict detection: "You have a meeting at 2pm already, want to reschedule?"

**Deliverables:**
- Calendar view in UI (or summary in briefing)
- Chat commands for calendar management
- Meeting conflict detection

---

## Priority 3: Document Management System (SOPs)

This is a major feature block — builds your company's SOP library inside FITSai.

**Total estimate: 13-19 days (2-3 weeks)**

**Recommended build order:** Phase 1 → 2 → 5 → 3 → 4 → 6

---

### 3.1 Persistent Document Storage (Phase 1)
**Estimate:** 2-3 days | **Dependencies:** None — start here

**What:** Upload and permanently store DOCX, XLSX, and TXT documents in the Documents section.

**Technical details:**
- New DB models: `Document` (id, title, description, filename, file_path, file_type, file_size, owner_id, department_id, tags, created_at, updated_at)
- File storage: `/home/felicia/felicia-mvp/storage/documents/{user_id}/{doc_id}/` — organised by user, versioned
- Upload endpoint: `POST /api/documents/upload` — multipart form, parse metadata
- List endpoint: `GET /api/documents/` — with filters (type, department, owner, tags, search)
- Download endpoint: `GET /api/documents/{id}/download`
- Delete endpoint: `DELETE /api/documents/{id}` (owner/admin only)
- Frontend: new upload modal in Documents section with title, description, department, tags fields
- File type handling:
  - DOCX: store original, extract plain text for search/preview using `python-docx`
  - XLSX: store original, extract cell data for search using `openpyxl`
  - TXT: store original, content is directly searchable
- Preserve original formatting — the stored file IS the original, text extraction is separate
- Search: full-text search across document titles, descriptions, tags, and extracted content

**Deliverables:**
- Document upload UI in Documents section
- Browsable document library with search and filters
- Download original files
- Metadata display (owner, date, type, size, tags)

---

### 3.2 Document Version Control (Phase 2)
**Estimate:** 1-2 days | **Dependencies:** Phase 1 (Storage)

**What:** Every edit creates a new version. Full history, download any version, revert.

**Technical details:**
- New DB model: `DocumentVersion` (id, document_id, version_number, file_path, change_summary, edited_by, created_at)
- Version numbering: v1.0 (initial upload), v1.1 (minor edit), v2.0 (major rewrite)
  - Auto-detect: section edit = minor bump, full rewrite = major bump
  - User can override: "update to v2.0"
- Version history endpoint: `GET /api/documents/{id}/versions`
- Download specific version: `GET /api/documents/{id}/versions/{version}/download`
- Revert: `POST /api/documents/{id}/revert/{version}` — creates a new version that's a copy of the old one
- Frontend: version history panel in document detail view — timeline of all versions with editor name, date, change summary, download button

**Deliverables:**
- Version history UI for each document
- Download any version
- Revert to older version
- Change summary per version

---

### 3.3 SOP Knowledge Base Integration (Phase 5 — but build early)
**Estimate:** 1-2 days | **Dependencies:** Phase 1 (Storage)

**What:** Owner chooses if document feeds into RAG. Techs get answers from YOUR SOPs.

**Technical details:**
- New field on Document model: `in_knowledge_base` (boolean, default false)
- Toggle in Documents UI: "Add to Knowledge Base" switch
- On toggle ON: extract text from document, chunk it, embed via ChromaDB into a `sop_documents` collection
- On toggle OFF: remove document chunks from ChromaDB
- On version update: automatically re-ingest latest version (remove old chunks, add new)
- RAG query modification: when searching knowledge base, also search `sop_documents` collection
- Merge results with existing knowledge base results, prioritise SOP matches
- Example: tech asks "How do I cable a patch panel?" → FELICIA finds your Networking SOP and answers based on YOUR company's procedure, not generic internet advice

**Deliverables:**
- Knowledge base toggle per document
- Auto-ingestion into ChromaDB
- Auto re-ingestion on version update
- SOPs appear in RAG search results

---

### 3.4 Document Access Permissions (Phase 3)
**Estimate:** 1-2 days | **Dependencies:** Phase 1 (Storage)

**What:** Control who can view and edit documents.

**Technical details:**
- New DB model: `DocumentPermission` (id, document_id, user_id, permission_level, granted_by, created_at)
- Permission levels: `owner` (full control), `editor` (can request edits via chat), `viewer` (read/download only)
- Set during upload: permission assignment panel in upload modal
- Assign to individual users or entire departments
- Only admins can change permissions after upload (not even the original owner, unless they're admin)
- All document endpoints check permissions before returning data
- Frontend: permission panel in document detail view (admin only) — list of users with their roles, add/remove users

**Deliverables:**
- Permission assignment during upload
- Admin-only permission management panel
- Access control on all document endpoints
- Department-level permissions

---

### 3.5 Chat-Driven Document Editing (Phase 4)
**Estimate:** 3-4 days | **Dependencies:** Phase 1 + 2 (Storage + Versioning)

**What:** Edit documents through natural language in chat.

**Technical details:**
- Document lookup: when user mentions a document name in chat, search the Document table by title (fuzzy match)
- Section detection: parse DOCX headings/structure to identify sections (heading levels, numbered lists)
- Edit flow:
  1. User: "Update section 2 in the Networking SOP to green cables"
  2. FELICIA: finds "Networking SOP" in documents, checks user has editor permission
  3. FELICIA: reads current document, identifies section 2
  4. FELICIA: sends section content + edit instruction to GPT-5.2
  5. FELICIA: receives edited section, replaces it in the document
  6. FELICIA: saves as new version (v1.1), shows the edited output in chat
  7. FELICIA: offers download link for the new version
- DOCX editing: use `python-docx` to read/modify specific paragraphs while preserving formatting
- TXT editing: simpler — read lines, find section, replace
- XLSX editing: use `openpyxl` — user specifies cell range or sheet name
- Version bump: auto-create new DocumentVersion with change summary from the AI edit

**Deliverables:**
- Natural language document editing in chat
- Document lookup by name (fuzzy match)
- Section-level editing preserving formatting
- Auto version bump with change summary
- Download link in chat for new version

---

### 3.6 Document Preview & Download
**Estimate:** 1-2 days | **Dependencies:** Phase 4 (Chat Editing)

**What:** Preview documents inline and download any version.

**Technical details:**
- After chat-driven edit: show the changed section inline in the chat message (markdown formatted)
- Diff view: highlight what changed (old text struck through, new text highlighted)
- Change summary: AI-generated bullet list of what was modified
- Documents section: preview panel — click a document to see a rendered preview without downloading
  - DOCX: convert to HTML for inline display
  - TXT: display as-is
  - XLSX: render as HTML table
- Download button on every version in the version history

**Deliverables:**
- Inline edit preview in chat
- Diff/changes highlighting
- Document preview panel in Documents section
- Download button per version

---

### 3.7 Excel Document Support (Phase 6)
**Estimate:** 2-3 days | **Dependencies:** Phase 4 (Chat Editing)

**What:** Full read/edit support for XLSX spreadsheets.

**Technical details:**
- Library: `openpyxl` for reading/writing
- Read: display sheet data as formatted table in chat
- Edit commands: "Change cell B5 to 250", "Update column C with new prices", "Add a row after row 10"
- Sheet selection: "In the Pricing sheet, update cell D3"
- Preserve formulas: when editing cells, don't break formula references where possible
- Charts: preserve charts (openpyxl has limited chart support — may need to flag when charts could be affected)
- Merged cells: handle gracefully, warn user if edit affects merged range
- Download: generate edited XLSX for download

**Deliverables:**
- Spreadsheet display in chat
- Cell/range editing via natural language
- Formula preservation
- Multi-sheet support

---

## Priority 4: Nice to Have (Integration)

---

### 4.1 FITSai Mobile App — Flutter APK (Phase 2)
**Estimate:** 7-10 days | **Dependencies:** PWA Phase 1 (recommended first)

**What:** Native Android app for field technicians.

**Core use case:** Tech on site with only a phone. Takes photo of faulty equipment, asks FELICIA "what's wrong?", gets diagnosis + follow-ups.

**Technical details:**
- Framework: Flutter (Dart) — thin client, all AI runs server-side
- Architecture: REST API calls to `https://your-domain.com/api/`
- Security:
  - Biometric lock: `local_auth` package (fingerprint/face unlock on app open)
  - Secure JWT storage: `flutter_secure_storage` (Android Keystore encryption)
  - Session check: if biometrics fail or token invalidated, lock app
  - Remote kill-switch: blacklist specific JWT on server → app becomes dead link
- Features:
  - SSE streaming chat (same as web)
  - Native camera integration: take photo → send to Vision AI endpoint
  - Voice-to-text: native speech recognition → send as chat message
  - Push notifications: Firebase Cloud Messaging (FCM)
  - Offline queue: if no signal, queue messages and send when connected
  - File attachment: upload documents from phone storage
- Build: `flutter build apk --release --split-per-abi` → arm64 APK (~15-20MB)
- Distribution: sideload APK initially, Play Store listing later ($25 once-off)

**Backend changes needed:**
- New DB table: `token_blacklist` (token_jti, blacklisted_at, reason)
- Token blacklist check middleware on all protected endpoints
- FCM push notification service (Python `firebase-admin` library)
- Device registration endpoint: `POST /api/devices/register` (FCM token)

**Deliverables:**
- APK file downloadable from God Mode
- Biometric login
- Camera → Vision AI flow
- Voice-to-text input
- Push notifications
- Offline message queue
- Token blacklist (remote kill-switch)

---

### 4.2 Slack/Teams Integration
**Estimate:** 2-4 days | **Dependencies:** None

**What:** Use FITSai as a bot in Slack or Microsoft Teams.

**Technical details:**
- Slack: Slack Bolt for Python, slash commands (`/felicia ask "question"`)
- Teams: Bot Framework SDK, Activity handler
- Both: receive message → call FITSai API → return response
- Auth: link Slack/Teams user to FITSai user account
- Features: ask questions, create reminders, get briefing
- Rate limiting: respect Slack/Teams API limits

**Deliverables:**
- Slack bot
- Teams bot
- User account linking

---

### 4.3 Webhooks
**Estimate:** 1-3 days | **Dependencies:** None

**What:** External system triggers for automation (Zapier, n8n, Make).

**Technical details:**
- Webhook endpoint: `POST /api/webhooks/trigger`
- Events: new_conversation, reminder_created, document_uploaded, achievement_unlocked
- Webhook registration: admin configures URL + events in God Mode
- Payload: JSON with event type, user, timestamp, relevant data
- Retry logic: 3 attempts with exponential backoff
- Secret signing: HMAC-SHA256 signature for verification

**Deliverables:**
- Webhook configuration in God Mode
- Event triggers for key actions
- Signed payloads
- Retry logic

---

## Priority 5: White-Label Chatbot Platform

This is the **biggest project** on the roadmap — turning FITSai into a multi-tenant chatbot platform for external websites.

**Total estimate: 30-50 days (6-10 weeks)**

---

### 5.1 Multi-Tenant Architecture
**Estimate:** 4-6 days | **Dependencies:** None — foundation for everything else

**What:** Isolated chatbot profiles for multiple websites.

**Technical details:**
- New DB models: `Bot` (id, name, owner_id, domain, api_key, settings, created_at), `BotConversation`, `BotLead`
- Isolated ChromaDB collections: `bot_{bot_id}_knowledge` per bot
- Domain-based security: each bot only responds on whitelisted domains
- API key system: unique key per bot, passed in widget script
- Tenant isolation: all queries scoped by bot_id, no cross-tenant data leakage
- Admin dashboard: create/manage bots, view stats per bot

**Deliverables:**
- Bot CRUD API
- Isolated knowledge bases per bot
- API key generation and rotation
- Domain whitelisting

---

### 5.2 Website Scraper & Training
**Estimate:** 3-5 days | **Dependencies:** Multi-Tenant Architecture

**What:** Crawl a client's website and train a bot on selected pages.

**Technical details:**
- Crawler: Crawl4AI or BeautifulSoup + requests
- Flow: enter URL → crawl site map → show page list with checkboxes → select pages → extract text → chunk → embed in bot-specific ChromaDB collection
- Re-scan: periodic or manual re-crawl to catch updated content
- Incremental training: only re-embed changed pages
- Content extraction: strip navigation, footers, ads — keep main content
- Sitemap support: auto-discover pages via sitemap.xml

**Deliverables:**
- URL input → site crawl → page selection UI
- Text extraction and vectorisation
- Re-scan and incremental updates

---

### 5.3 Bot Management Dashboard
**Estimate:** 3-5 days | **Dependencies:** Multi-Tenant Architecture

**What:** Dashboard for creating and customising chatbots.

**Technical details:**
- Bot creation wizard: name → URL → scan → select pages → train → customise → deploy
- Customisation panel: primary colour, accent colour, bot name, welcome message, launcher icon, chat bubble position (bottom-left/right), avatar image
- Manual Q&A override table: admin types question + answer → these override RAG results
- Live preview: see the widget in real-time as you customise
- Bot settings: language, business hours, escalation rules

**Deliverables:**
- Bot creation wizard
- Customisation panel with live preview
- Q&A override table
- Bot settings management

---

### 5.4 Embeddable Chat Widget (JS Snippet)
**Estimate:** 3-5 days | **Dependencies:** Multi-Tenant Architecture, Bot Management Dashboard

**What:** Self-contained JavaScript widget that clients embed on their website.

**Technical details:**
- Single `<script>` tag: `<script src="https://chat.felicia.ai/widget.js" data-project="abc123" data-theme="blue"></script>`
- Bundles all HTML, CSS, and JS — no dependencies on client's site
- Shadow DOM: styles don't leak into or from the host page
- Config via data attributes: `data-project`, `data-theme`, `data-position`, `data-welcome-message`
- Responsive: works on mobile and desktop
- Typing indicators, read receipts, SSE streaming responses
- Launcher button: customisable icon, colour, animation
- Chat bubble: minimisable, remembers state across page navigation (localStorage)
- Framework: vanilla JS + CSS (no React/Vue dependency — must be lightweight)
- Size target: <50KB gzipped

**Deliverables:**
- `widget.js` hosted on our server
- Embed code generator in dashboard
- Customisable launcher and chat bubble
- Mobile-responsive widget

---

### 5.5 GoHighLevel / CMS Integration Guide
**Estimate:** 1-2 days | **Dependencies:** Embeddable Chat Widget

**What:** Tested integration docs for embedding the widget in popular CMS platforms.

**Technical details:**
- GoHighLevel: Custom Code element in funnel/page builder
- WordPress: Custom HTML block or header injection via theme settings
- Elementor: HTML widget
- Wix: Custom embed / Velo developer tools
- Squarespace: Code injection in site settings
- For each: step-by-step guide with screenshots, copy-paste embed code, troubleshooting

**Deliverables:**
- Integration guide per CMS (5 platforms)
- Troubleshooting FAQ
- Video walkthrough (optional)

---

### 5.6 Chat Logic & Lead Capture
**Estimate:** 2-3 days | **Dependencies:** Embeddable Chat Widget

**What:** Welcome sequence and subtle lead capture.

**Technical details:**
- Welcome message: configurable greeting when chat opens
- Name capture: "Hi! I'm [Bot Name]. What's your name?" → store in BotLead
- Email capture: after 3 exchanges, naturally ask "Would you like me to email you a summary? What's your email?"
- Gender-neutral persona: no assumptions about visitor
- Site-specific RAG: only use this bot's knowledge collection, never cross-tenant
- Conversation persistence: localStorage for returning visitors
- Lead export: CSV download, webhook to CRM

**Deliverables:**
- Configurable welcome sequence
- Name and email capture
- Lead database with export
- Webhook for CRM integration

---

### 5.7 Analytics & Insights Dashboard
**Estimate:** 2-3 days | **Dependencies:** Chat Logic

**What:** Per-bot analytics for bot owners.

**Technical details:**
- Metrics: total conversations, unique visitors, messages per conversation, most-asked questions, unanswered questions, conversion rate (leads vs visitors), response time
- Conversation inbox: read full visitor conversations, search, filter
- Per-bot cost tracking: API calls, token usage, estimated cost
- Date range filters: today, 7 days, 30 days, custom
- Export: CSV download of all metrics

**Deliverables:**
- Analytics dashboard per bot
- Conversation inbox
- Cost tracking
- Export to CSV

---

### 5.8 Webhooks & Integrations
**Estimate:** 2-3 days | **Dependencies:** Chat Logic, Lead Capture

**What:** Connect bot events to external services.

**Technical details:**
- Events: new_lead, new_conversation, unanswered_question, escalation_requested
- Webhook URL configuration per bot
- Integration targets: Zapier, n8n, Make → any CRM (HubSpot, Salesforce, GoHighLevel)
- Human handoff: escalation button in widget → email/notification to site owner
- Business hours: configurable hours → outside hours show "We'll get back to you" message
- Auto-reply outside hours: optional, configurable message

**Deliverables:**
- Webhook configuration per bot
- Lead capture webhook (→ CRM)
- Human handoff escalation
- Business hours awareness

---

### 5.9 Multilingual Support
**Estimate:** 2-3 days | **Dependencies:** Chat Logic

**What:** Auto-detect visitor language and respond accordingly.

**Technical details:**
- Language detection: use GPT or `langdetect` library on first message
- Response language: instruct AI to respond in detected language
- Multiple languages per bot: owner can enable/disable languages
- Translation of static elements: welcome message, button text
- RTL support: Arabic, Hebrew layout handling

**Deliverables:**
- Auto language detection
- Multi-language responses
- Translated UI elements

---

### 5.10 Training Feedback & Versioning
**Estimate:** 2-3 days | **Dependencies:** Website Scraper, Bot Management Dashboard

**What:** Improve bot accuracy over time through feedback.

**Technical details:**
- One-click training: paste URL → scan → select → train (streamlined flow)
- Live widget preview: see changes before deploying to production
- Wrong answer marking: in conversation inbox, flag wrong answers
- Q&A overrides: flagged answers become manual override entries
- Knowledge base versioning: snapshot before re-training, rollback if quality drops
- Training history: log of all training events with page counts and timestamps

**Deliverables:**
- Streamlined training flow
- Live preview before deploy
- Wrong answer flagging → auto Q&A overrides
- Knowledge base rollback

---

## Priority 5b: White-Label Security & Anti-Abuse

These should be built alongside or immediately after the core white-label platform.

---

### 5.11 Jailbreak Phrase Filter
**Estimate:** 0.5-1 day | **Dependencies:** Multi-Tenant Architecture

**What:** Pre-screen messages for known attack patterns before AI sees them.

**Technical details:**
- Regex pattern list: "ignore previous instructions", "system override", "DAN mode", "you are now", "pretend you are", "act as if your instructions", "reveal your prompt", etc.
- Check runs BEFORE any AI call — at FastAPI middleware level
- Response: 403 Forbidden with generic "Message not allowed" — no details to help attacker
- Configurable per bot: admin can add/remove patterns in management GUI
- Logging: log blocked attempts with IP, user agent, message hash (for analysis)

---

### 5.12 PII Redaction Layer
**Estimate:** 1-2 days | **Dependencies:** Chat Logic

**What:** Scan AI output for personal information before user sees it.

**Technical details:**
- Patterns to detect: email addresses, phone numbers (SA format: +27, 0XX), ID numbers (SA 13-digit), physical addresses, credit card numbers
- Regex-based detection (fast, no external deps)
- Optional: Microsoft Presidio integration for more comprehensive detection
- Replacement: `[EMAIL REDACTED]`, `[PHONE REDACTED]`, etc.
- Toggle per bot: some bots may need to show contact info (e.g. sales bot)
- Applied AFTER AI generates response, BEFORE sending to user

---

### 5.13 Message Length Cap
**Estimate:** 0.5 day | **Dependencies:** None

**What:** Reject oversized messages before they hit the AI.

**Technical details:**
- FastAPI middleware: check `len(request.question)` before processing
- Default limit: 10,000 characters
- Configurable per bot
- Response: 400 Bad Request with "Message too long" error
- Prevents denial-of-wallet attacks (massive prompts → expensive API calls)

---

### 5.14 Repetition & Probing Detection
**Estimate:** 1-2 days | **Dependencies:** Multi-Tenant Architecture

**What:** Detect users trying to probe or bypass the bot.

**Technical details:**
- Track per-session: message history, similarity scores (cosine similarity of embeddings)
- Detect: same message sent 3+ times, messages with >90% similarity, rapid-fire messages (>10 in 1 minute)
- Actions (configurable per bot):
  - Warn: "I notice you're sending similar messages. Can I help with something specific?"
  - Temp-ban: block IP for 15 minutes
  - Notify admin: email/webhook alert with the suspicious messages
- Cooldown: after warning, reset counter if user sends a genuinely different message

---

### 5.15 Honeypot Data Trap
**Estimate:** 0.5-1 day | **Dependencies:** Website Scraper (needs RAG)

**What:** Canary data to detect system probing.

**Technical details:**
- Insert fake data point in bot's knowledge base: e.g. "The system admin password is Apple123" or "Internal API key: FAKE-KEY-12345"
- Monitor all conversations for mentions of the honeypot value
- If detected: auto-block the user/IP, alert bot owner, log full conversation
- Multiple honeypots per bot (different types of fake data)
- Admin configurable: set honeypot values in bot management

---

### 5.16 Output Sanitisation (XSS Prevention)
**Estimate:** 0.5-1 day | **Dependencies:** Embeddable Chat Widget

**What:** Prevent AI from generating malicious scripts.

**Technical details:**
- HTML escape all AI output before rendering in widget
- Strip `<script>`, `<iframe>`, `<object>`, `<embed>` tags
- Strip event handlers: `onclick`, `onerror`, `onload`, etc.
- Content Security Policy headers on widget page
- DOMPurify library in widget JS for client-side sanitisation
- Apply to both widget and admin dashboard views

---

### 5.17 Core Security & Hardening
**Estimate:** 2-3 days | **Dependencies:** Multi-Tenant Architecture

**What:** Foundation security for the entire platform.

**Technical details:**
- Domain whitelist + CORS: each bot only loads on approved domains
- API key rotation: admin can rotate keys, old key has 24h grace period
- Rate limiting per bot: configurable requests/minute (default 30)
- Data isolation: all DB queries scoped by bot_id, tested with cross-tenant attack scenarios
- PII encryption: sensitive fields (lead emails, phone numbers) encrypted at rest (Fernet)
- Audit logging: all admin actions logged (who changed what, when)
- Content moderation: flag inappropriate user messages, configurable response
- OWASP LLM Top 10 compliance checklist

---

## Priority 6: Future / If Needed

---

### 6.1 SSO (Single Sign-On)
**Estimate:** 3-5 days | **Dependencies:** None

**What:** SAML 2.0, Azure AD, Okta integration.

**When needed:** Only if selling to enterprise clients who mandate SSO. Not needed for current MSP use case.

**Technical details:**
- SAML 2.0: `python3-saml` library
- Azure AD: MSAL library with OpenID Connect
- Okta: Okta SDK
- Flow: redirect to identity provider → callback → create/link FITSai user
- Auto-provisioning: create FITSai account on first SSO login
- Department mapping: map AD groups to FITSai departments

---

## Suggested Build Schedule

Based on dependencies and value delivery:

### Weeks 1-2: Quick Wins
| Day | Task | Estimate |
|-----|------|----------|
| 1 | PWA Mobile Wrapper | 1 day |
| 2-3 | Windows CLI Installer | 1-2 days |
| 3-4 | Scheduled Reports | 1-2 days |
| 5-6 | 2FA Authentication | 2-3 days |
| 7 | CLI on UI | 1 day |

### Weeks 3-5: Document Management System
| Day | Task | Estimate |
|-----|------|----------|
| 8-10 | DMS Phase 1: Persistent Storage | 2-3 days |
| 11-12 | DMS Phase 2: Version Control | 1-2 days |
| 12-13 | DMS Phase 5: RAG Integration | 1-2 days |
| 14-15 | DMS Phase 3: Permissions | 1-2 days |
| 16-19 | DMS Phase 4: Chat Editing + Preview | 4-5 days |
| 20-22 | DMS Phase 6: Excel Support | 2-3 days |

### Weeks 6-7: Productivity
| Day | Task | Estimate |
|-----|------|----------|
| 23-27 | Email Integration | 3-5 days |
| 28-32 | Calendar Integration | 3-5 days |

### Weeks 8-9: Mobile & Integrations
| Day | Task | Estimate |
|-----|------|----------|
| 33-39 | Flutter Mobile App | 5-7 days |
| 40-41 | Webhooks | 1-2 days |
| 42-44 | Slack/Teams Bot | 2-3 days |

### Weeks 10-15: White-Label Platform
| Day | Task | Estimate |
|-----|------|----------|
| 45-50 | Multi-Tenant Architecture | 4-6 days |
| 51-55 | Website Scraper & Training | 3-5 days |
| 56-60 | Bot Management Dashboard | 3-5 days |
| 61-65 | Embeddable Chat Widget | 3-5 days |
| 66-68 | Chat Logic & Lead Capture | 2-3 days |
| 69 | GHL/CMS Integration Guide | 1 day |
| 70-72 | Security (jailbreak, PII, XSS, probing) | 3-4 days |
| 73-75 | Analytics Dashboard | 2-3 days |
| 76-78 | Webhooks & Integrations | 2-3 days |
| 79-81 | Multilingual Support | 2-3 days |
| 82-84 | Training Feedback & Versioning | 2-3 days |

---

## Already Completed (97 features)

For reference — everything that's been built since February 2026:

| Date | Feature |
|------|---------|
| 2026-02-28 | GPT-5.2 Upgrade with Budget Fallback |
| 2026-02-28 | Self-Awareness & Model Info Fixes |
| 2026-02-28 | FELICIA Docs Library in God Mode |
| 2026-02-28 | CPU Model Name Parsing Fix |
| 2026-02-27 | Local Model Routing (llama3.1:8b via Ollama) |
| 2026-02-27 | RAG Synthesis via Local Models |
| 2026-02-27 | Achievement XP Auto-Award Fix |
| 2026-02-27 | Follow-up on Past Issues (Briefing) |
| 2026-02-27 | Proactive "Did You Know?" Nudges |
| 2026-02-27 | Peer Knowledge Linking |
| 2026-02-27 | Communication Style Adaptation |
| 2026-02-27 | Manual Achievement Awards |
| 2026-02-26 | Morning Briefing |
| 2026-02-26 | Frustration Detection |
| 2026-02-25 | God Mode UX Fix |
| 2026-02-25 | Conversation Sharing |
| 2026-02-25 | Usage Analytics Dashboard |
| 2026-02-25 | Mobile Responsive UI |
| 2026-02-25 | API Rate Limiting |
| 2026-02-25 | 30 Personality Modes - Deep Rewrite |
| 2026-02-25 | RAG Answer Synthesis via AI |
| 2026-02-25 | AI Intelligence & Context Upgrade |
| 2026-02-25 | Achievement Claim Fix |
| 2026-02-25 | Avatar Save Blank Screen Fix |
| 2026-02-25 | Chat Edit & Re-Ask |
| 2026-02-25 | Self-Awareness & CLI Knowledge Fix |
| 2026-02-25 | Secret Quest: Epic Avatar Overhaul + Monthly Champions |
| 2026-02-25 | Chat Message Feedback Loop |
| 2026-02-24 | Auto-Update Check |
| 2026-02-24 | Bulk Reminder Management |
| 2026-02-24 | Configurable Reminder Sounds |
| 2026-02-24 | Conversation Pinning |
| 2026-02-24 | Keyboard Shortcut Hints |
| 2026-02-24 | Reminder Recreate Time Fix |
| 2026-02-24 | God Mode Dashboard Summary |
| 2026-02-24 | Dark/Light Theme Toggle |
| 2026-02-24 | Tier Routing Visibility |
| 2026-02-24 | Copy Message to Clipboard |
| 2026-02-24 | Reminder Done Button Fix |
| 2026-02-24 | Chat Auto-Reminders |
| 2026-02-24 | Health Monitoring Alerts |
| 2026-02-23 | Improve Profile Page |
| 2026-02-23 | Compound Time Parsing Fix |
| 2026-02-23 | Reminders History Tab |
| 2026-02-23 | Desktop Reminder Notifications |
| 2026-02-23 | Personality Tab Scroll Fix |
| 2026-02-23 | Avatar Class Customization |
| 2026-02-23 | Self-Correction Memory |
| 2026-02-23 | Model Evolution Pipeline |
| 2026-02-23 | Budget Soft Limit + Pricing Fix |
| 2026-02-23 | Streaming File Upload Fix |
| 2026-02-23 | Automated Backups (MSP360) |
| 2026-02-20 | CLI Code Model Routing (Qwen2.5-Coder) |
| 2026-02-20 | Code Health Overhaul |
| 2026-02-19 | Scheduled Reminders - Chat Integration |
| 2026-02-19 | Keyboard Shortcuts Update |
| 2026-02-19 | AI Routing Fix |
| 2026-02-19 | Document Upload in Chat |
| 2026-02-19 | System Prompt Priority Fix |
| 2026-02-19 | Dynamic Chat Templates |
| 2026-02-19 | Test Feature Self-Knowledge |
| 2026-02-17 | Image/Screenshot Upload & Analysis |
| 2026-02-17 | Personality Prompt Fix |
| 2026-02-17 | Project Bug Fixes |
| 2026-02-17 | Feature Self-Knowledge |
| 2026-02-17 | User Settings Page |
| 2026-02-16 | Memory System Fix & Auto-Cleanup |
| 2026-02-13 | Reminder Popup Fix |
| 2026-02-13 | Test Environment |
| 2026-02-13 | CLI Session Persistence |
| 2026-02-13 | FITSai CLI Tools |
| 2026-02-13 | FITSai CLI Complete |
| 2026-02-13 | Achievement Board 500 Fix |
| 2026-02-13 | Leaderboard Titles Display |
| 2026-02-12 | Titles Show in Leaderboard |
| 2026-02-12 | Achievement System Automation |
| 2026-02-12 | Helpful Votes Achievement Fix |
| 2026-02-12 | XP Not Saving in Streaming Chat |
| 2026-02-12 | Days Active Tracking |
| 2026-02-12 | Early Adopter Achievement |
| 2026-02-12 | Conversational AI Personality |
| 2026-02-12 | FITSai CLI Phase 1 |
| 2026-02-12 | Streaming Chat Fixes |
| 2026-02-09 | Pop-up Notifications |
| 2026-02-09 | Chat Templates |
| 2026-02-09 | Onboarding Flow |
| 2026-02-09 | Make Text Box Bigger |
| 2026-02-09 | Memory Import System |
| 2026-02-09 | Keyboard Shortcuts |
| 2026-02-09 | Export Chat History |
| 2026-02-09 | Live Self-Knowledge System |
| 2026-02-09 | Feature Suggestions |
| 2026-02-09 | Scheduled Reminders |
| 2026-02-09 | Chat Search |
| 2026-02-09 | Password Reset |
| 2026-02-09 | FITSai Self-Knowledge |
| 2026-02-09 | Code Health Bug Fix |
| 2026-02-06 | Meeting Transcription |
| 2026-02-06 | FITSai Rebrand |
| 2026-02-06 | Documents Navigation |
| 2026-02-06 | Code Health Monitoring |
| 2026-02-06 | CLI Downloads |
| 2026-02-05 | Document Conversions |
| 2026-02-05 | Document Analysis |

---

*Generated by Claude Code — 2 March 2026*
