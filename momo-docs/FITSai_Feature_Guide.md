# FITSai Complete Feature Guide

**Version:** 2.0 | **Last Updated:** 2026-02-28
**Product:** FITSai (Friendly Intelligent Technical Support AI)
**Internal Codename:** FELICIA (Friendly Engine for Logic, Insight, Coordination, Information & Assistance)

---

## 1. AI Chat

The core feature. Ask FITSai anything and get an intelligent, personality-driven response.

**How to use:**
- Type your question in the chat box and press Enter
- Attach images (screenshot analysis), PDFs, DOCX, or TXT files using the paperclip button
- Drag and drop files directly into the chat
- Use your phone camera to capture and send photos
- Give thumbs up/down feedback to help FITSai learn
- Edit and re-ask previous messages in a thread
- Each question earns XP towards your level

**Smart AI Routing:**
- **Simple questions** → llama3.1:8b (local GPU via Ollama) — fast, free, private
- **Coding questions** → deepseek-coder-v2 (local GPU via Ollama)
- **Complex reasoning / images** → GPT-5.2 (OpenAI API)
- **Knowledge base matches** → RAG synthesis through local model, GPT-5.2 fallback
- **Budget protection** → Auto-fallback to cheaper models if monthly budget limit approaches

**Self-Correction:** Every local model answer is graded in the background by GPT. Corrections are saved and used to improve future responses.

**Conversation Features:**
- Threaded replies — continue any conversation
- Search across all chat history (Ctrl+K)
- Pin conversations to sidebar top
- Export chats as JSON or TXT
- Share/copy entire conversation threads
- Chat templates (Ctrl+T) — predefined and AI-generated based on your patterns

---

## 2. Voice Chat

Talk to FITSai using your microphone instead of typing.

**How to use:**
- Click the microphone icon in the chat input
- Allow browser microphone access when prompted
- Speak your question clearly
- FITSai transcribes your speech, processes it, and speaks the answer back

**Technology:** OpenAI Whisper (speech-to-text), OpenAI TTS (text-to-speech), real-time WebSocket communication.

---

## 3. Smart Colleague Intelligence

FITSai goes beyond Q&A — it acts like a smart colleague who knows your team.

### Morning Briefing
Personalized daily greeting when you open chat:
- Your login streak and level progress
- Overdue reminders
- Achievement progress (closest unlockable)
- Follow-up on past unresolved issues ("Did that DNS fix work?")
- Proactive nudges ("You asked about VLANs 3 times — want a cheat sheet?")
- Personality-aware tips

### Frustration Detection
FITSai detects frustration from message tone (caps, punctuation, keywords) and responds with personality-appropriate empathy before jumping to solutions.

### Communication Style Adaptation
Learns your preferences (brevity, formality, technical depth) from your feedback patterns and adapts responses automatically over time.

### Peer Knowledge Linking
When you ask something a colleague has already solved, FITSai mentions it: "Thabo documented a fix for this last week."

---

## 4. 30 Personality Modes

Change how FITSai communicates with 30 distinct styles. New personalities unlock as you level up.

**How to switch:** Profile page → Personality Selector, or Settings → Display tab.

**Some favorites:**
- **Professional Maven** — Polished, efficient, corporate-friendly (default)
- **Sarcastic Sidekick** — Witty, dry humor, playfully cynical
- **Drill Sergeant** — Tough love and accountability
- **Noir Detective** — Dramatic 1940s private eye vibes
- **Mad Scientist** — Experimentally-minded and delightfully unhinged
- **Zen Minimalist** — Calm, concise, mindful responses
- **Chaotic Gremlin** — Playful chaos and unpredictable energy
- **Nerdy Explainer** — Loves details, references, and tangents
- **Cool Aunt** — Relaxed and supportive
- **Existential Overthinker** — Deep philosophical questions about everything

...and 20 more including Academic Scholar, Brutally Honest, Conspiracy Theorist, Game Show Host, Grandmother Wisdom, Hopeless Romantic, Punk Rebel, Southern Charm, and others.

Personality affects tone and communication style only — not accuracy or knowledge.

---

## 5. Gamification System

Everything you do in FITSai earns XP and progresses your character.

### XP & Leveling
- Every chat question earns XP
- Completing achievements awards bonus XP
- 50 levels with increasing XP requirements

### 12 Character Classes (by level)
| Level | Class | Style |
|-------|-------|-------|
| 1-5 | Kobold | Scrappy lizard warrior |
| 6-10 | Goblin | Sneaky rogue trickster |
| 11-15 | Troll | Heavy brute tank |
| 16-20 | Dwarf | Stout warrior with golden helmet |
| 21-25 | Elf | Ethereal mage with silver circlet |
| 26-30 | Wizard | Classic archmage with staff |
| 31-35 | Phoenix | Majestic fire bird |
| 36-40 | Unicorn | Armored mythical horse |
| 41-45 | Dragon | Fearsome dragon |
| 46-48 | Demigod | Divine warrior with lightning |
| 49 | God | Radiant divine being |
| 50 | BDFL | Cosmic emperor |

### Avatar Customization
- Unlock color schemes, backgrounds, and particle effects as you level up
- Display any unlocked character class avatar in your profile
- 10 color schemes (Ocean, Forest, Sunset, Royal, Crimson, Arctic, Shadow, Golden, Rainbow, Cosmic)
- 5 background effects (Glow, Border, Trail, Screen, Cosmic)

---

## 6. Achievements

31 achievements across multiple rarities: Common, Rare, Epic, Legendary, and Mythic.

**How to view:** Click "Achievements" in the navigation bar.

**Types:**
- **Activity-based:** First Steps (first question), Curious Mind (25 questions), Knowledge Seeker (100 questions)
- **Streak-based:** Consistent Learner (7-day streak), Dedicated User (30-day streak)
- **Social:** Helper (give feedback), Feature Suggester, Department Champion
- **Hidden/Secret:** Discover these by exploring FITSai's features
- **Admin-awarded:** Special achievements can be granted by admins in God Mode

Each achievement awards XP and may unlock titles you can equip next to your name on the leaderboard.

---

## 7. Leaderboard

See how you rank against colleagues.

**Displays:** Rank, name, level, character class, XP, equipped title, achievement count.

**Monthly Champions:** The top-ranked user each month receives special recognition with a golden crown frame and Hall of Fame entry.

---

## 8. Reminders

Natural language reminder system integrated into chat.

**How to use:** Just say it in chat:
- "Remind me to call John at 3pm"
- "Remind me to check the backup in 1 hour and 30 minutes"
- "Remind me every Monday to review tickets"

**Features:**
- Popup notifications (even when tab is not focused via desktop notifications)
- 25 notification sounds across 5 categories (Nice, Cute, IT, Wacky, Classic)
- Overdue reminders stay visible until dismissed or completed
- Bulk management — multi-select with checkboxes, bulk complete/delete
- History tab showing completed/dismissed reminders with recreate button
- Snooze options (5 min, 15 min, 1 hour, tomorrow)

---

## 9. Documents

Upload files for FITSai to learn from and analyze.

### Knowledge Base Upload
- Click "Documents" in navigation → Upload files
- Supported: PDF, Word (.docx), text files, images
- Content is indexed into the knowledge base for RAG retrieval
- FITSai references your documents when answering questions
- Department-scoped documents for team-specific knowledge

### In-Chat Document Analysis
- Attach a document directly in chat using the paperclip button
- Analysis modes: Summarize, Analyze, Extract key points, Memorize
- Supports PDF, DOCX, TXT, and images

### Document Conversion
- Convert DOCX/XLSX to PDF using LibreOffice backend

---

## 10. Projects

Team collaboration spaces with shared conversations.

**Features:**
- Create projects with title and description
- Add/remove team members by email
- Project-scoped chat — all members see the same conversations
- Overview tab with activity stats
- Archive completed projects

---

## 11. Profile & Settings

Your profile, stats, and all settings in one place.

**Profile sections:**
- Edit name and email
- Character avatar with class, level, and XP bar
- Personality selector
- Feature suggestions
- Reminder management

**Settings tabs:**
- **Notifications:** Toggle reminder popups, sounds, email notifications. Severity filter. Auto-dismiss.
- **Security:** Change password.
- **Display:** Theme (dark/light), personality mode.
- **Sessions:** View active sessions, logout from other devices.

---

## 12. Keyboard Shortcuts

Press `?` anywhere to see all shortcuts.

| Shortcut | Action |
|----------|--------|
| Ctrl+K | Search conversations |
| Ctrl+N | New conversation |
| Ctrl+T | Open chat templates |
| Ctrl+E | Export current chat |
| 1-4 | Navigate pages (Chat, Projects, Docs, Profile) |
| ? | Open shortcuts modal |

---

## 13. Dark/Light Theme

Toggle between dark and light mode. Persists across sessions.

**How to use:** Click the Sun/Moon icon in the navigation bar.

---

## 14. FITSai CLI (Command Line Tool)

Interactive terminal tool for developers and power users — like Claude Code.

**Commands:**
- `fitsai` — Launch interactive chat mode (REPL)
- `fitsai login` — Authenticate with your FITS credentials
- `fitsai chat "your question"` — Quick one-shot question
- `fitsai sessions --list` — View saved chat sessions

**Built-in tools:** Read files, edit files, write files, run bash commands, search with glob/grep. All executed locally with results sent to AI for context.

**Platforms:** Linux (x64), Debian/Ubuntu (.deb package). Windows installer planned.

---

## 15. Onboarding

8-step interactive wizard for new users covering chat, personality, achievements, projects, voice, reminders, and documents. Can be replayed via "Recap Tour" button.

---

## 16. God Mode (Admin Panel)

Admin dashboard available to admins and users level 46+. Access via the lightning bolt icon.

### Dashboard
- System stats: total users, questions, documents, average level, disk/memory usage
- Service status indicators with health checks
- Most active users today
- Git update check — shows when undeployed commits exist

### User Management
- Search and view all users
- Edit user details, roles, levels
- Award/revoke XP manually
- Create new users

### Achievement Management
- Search all 31 achievements
- Award or revoke achievements for any user
- Rarity legend and status indicators

### Code Health Monitoring
- Automated code scanning for issues
- Severity levels: Critical, High, Medium, Low
- Maintenance queue with schedule-fix workflow

### Feature Suggestions
- View user-submitted feature requests
- Status tracking (pending, planned, completed)

### Health Monitoring
- Background checks every 5 minutes (database, Ollama, disk, memory)
- Email alerts with cooldown and recovery notifications
- SMTP configuration

### Development Roadmap
- Interactive roadmap panel with status updates
- Categories: High Priority, Medium Priority, Improvements, Nice to Have

### FELICIA Documentation Library
- Browse and download project documents (brochures, playbooks, technical docs)
- Upload new documents with title, description, and category
- Character Avatar Manager — upload illustrations for all 12 RPG character classes
- Categories: Marketing, Technical, Assets

### System Tools
- **Bash:** Execute server commands directly
- **Create File:** Write files to the server
- **Services:** Start/stop/restart systemd services

### Self-Correction Memory
- View grading statistics (total graded, pass rate, corrections)
- Recent corrections list

### Model Evolution Pipeline
- Auto-benchmark local models monthly
- GPT-4o-mini judge scoring
- Promote better models automatically

---

## 17. Budget Tracking

Monitor AI API usage and costs (admin only).

**Displays:**
- Current month spend vs. $30 budget
- Cost breakdown by model (GPT-5.2, gpt-4o, gpt-4o-mini)
- Daily usage trends and projections
- Answer source breakdown (Local AI, Cloud AI, RAG)
- Top users by query count
- Feedback statistics

**Budget protection:** Automatic model fallback when approaching budget limit:
- Under 80% → GPT-5.2 (full power)
- 80-95% → gpt-4o (still excellent, cheaper)
- Over 95% → gpt-4o-mini (cheapest, functional)

---

## 18. Security

- JWT authentication with secure token storage
- Password reset via email token
- Role-based access control (User, Manager, Admin)
- API rate limiting (login: 10/min, register: 5/min, general: 200/min)
- All local AI queries stay on-premises — no data leaves the network

---

## Architecture Summary

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS + Vite |
| Backend | Python FastAPI + SQLAlchemy (async) |
| Database | PostgreSQL (Docker) |
| Local AI | Ollama (llama3.1:8b, deepseek-coder-v2) on NVIDIA RTX 4060 |
| Cloud AI | OpenAI GPT-5.2 (with auto-fallback) |
| Voice | OpenAI Whisper (STT) + OpenAI TTS |
| Knowledge | ChromaDB vector store for RAG |
| Server | Ubuntu 24.04 LTS, AMD Ryzen 7 5700, 32GB RAM |

---

*This document is auto-maintained alongside the FITSai codebase. For the latest version, download from God Mode → FELICIA Documentation.*
