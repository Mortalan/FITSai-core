# FITSai-Core (Codename: Momo) Master Blueprint & Roadmap

**Version:** 1.8.2 (Functional Core & Contextual Logic)
**Date:** 2026-03-05
**Objective:** To build a from-the-ground-up autonomous agentic ecosystem (Momo) that completely replaces and exceeds the legacy system (Felicia). Momo is an agent-first platform designed for enterprise autonomy, featuring a sleek minimalist UI, a stateful agentic brain, and full parity with all legacy features.

---

## 1. System Vision & Architecture

### 1.1 The "Agent-First" Core
Momo is a **Stateful Agentic System** built on a directed graph architecture.
*   **Logic Engine:** **LangGraph**. Provides a robust state-machine for multi-turn reasoning loops (Think -> Act -> Observe).
*   **Composability:** Every feature (memory, tools, integrations, UI widgets) is a decoupled component.
*   **Unified Tooling:** Tools exist at the core level, shared between Web, CLI, and API.

### 1.2 Architectural Principles
*   **Monorepo Structure:** `/backend`, `/frontend`, `/cli`, `/shared`.
*   **Performance First:** Async-native FastAPI backend, sub-100ms API latency.
*   **Gemini-Inspired Design:** Minimalist aesthetic, clean typography, seamless Light/Dark transitions.
*   **Production Coexistence:** Isolated evolution on Port 9000 (Back) / 8003 (Front) to ensure Felicia (Legacy) remains stable.

---

## 2. Technical Stack

### 2.1 Backend (The Brain)
*   **Framework:** Python 3.12+ with **FastAPI**.
*   **Orchestration:** **LangGraph** (with persistent Checkpointers for session resilience).
*   **Routing Engine:** 3-Tier AI Router (Tier 1: Fast, Tier 2: Mini, Tier 3: Complex).
*   **Database:** PostgreSQL (SQLAlchemy 2.0), ChromaDB (Vector), Redis (State/Queue).
*   **Security:** JWT, OAuth2, AES-256-GCM encryption, TLS 1.3.

### 2.2 Frontend (The Portal)
*   **Framework:** **React 19** + **TypeScript**.
*   **Style:** **Tailwind CSS v4** + **Shadcn UI**.
*   **Graphics:** **Three.js** (for Holographic Avatar - *Visual Only, Optional*).
*   **State:** Zustand (UI) + TanStack Query (Server).
*   **Real-time:** WebSockets/SSE for agent observation and notifications.

---

## 3. Implementation Phases (The Porting Guide)

### Phase 1: Core Scaffolding (v1.1.0) - COMPLETE ✅
*   [x] Initialize Monorepo structure and GitHub Sync.
*   [x] Backend: FastAPI + Auth + Postgres/Alembic setup.
*   [x] Frontend: React 19 + Tailwind v4 + Gemini layout.
*   [x] Initial Database Schema (Users table).

### Phase 2: Agent Engine & UI (v1.2.0) - COMPLETE ✅
*   [x] LangGraph state-machine implementation.
*   [x] Real-time Streaming API (SSE).
*   [x] Premium Agent Visibility (Action Cards).
*   [x] Authentication & Identity integration (JWT).

### Phase 3: Gamification (v1.3.0) - COMPLETE ✅
*   [x] Port User XP and Leveling system (50-level tiers).
*   [x] Re-implement Achievement engine (100+ seeded).
*   [x] Character Class Progression (Kobold to BDFL).
*   [x] Progress Dashboard in Sidebar.

### Phase 4: Knowledge (v1.4.0) - COMPLETE ✅
*   [x] Document Storage & Versioning Database Schema.
*   [x] Knowledge Base (SOP) Library UI (List, Read, Create).
*   [x] Autonomous SOP Creation/Reading via Agentic Tools.

### Phase 5: Enterprise Tools (v1.5.0) - COMPLETE ✅
*   [x] GHL (GoHighLevel) Service and Contact Lookup tool.
*   [x] GLPI Asset Management Service and Search tool.
*   [x] Multi-tenant / White-labeling foundation (Department model).
*   [x] Sidebar Department Branding integration.

### Phase 6: Routing & Personalities (v1.6.0) - COMPLETE ✅
*   [x] 3-Tier Router implementation (Tier 1: Fast, Tier 2: Mini, Tier 3: Complex).
*   [x] Automatic Model Selection (GPT-4o vs GPT-4o-mini).
*   [x] Ported 31 Natural Personality modes (31 seeded).

### Phase 7: Avatar & Voice (v1.7.0) - COMPLETE ✅
*   [x] Speech-to-Text (Whisper) & Text-to-Speech (OpenAI).
*   [x] WebSocket-based Voice Chat implementation.
*   [x] Audio-reactive 3D Holographic Persona (Visual Only).

### Phase 8: Operational & Contextual Logic (v1.8.0) - IN PROGRESS 🔄
*   [x] **Chat History:** Persistent storage and sidebar retrieval.
*   [x] **Long-term Memory:** ChromaDB + SentenceTransformers (CPU-safe).
*   [x] **Background Extraction:** LLM-driven fact extraction from chats.
*   [x] **Budget Tracking:** Department and User-level cost monitoring.
*   [x] **Admin Reorg:** Move God Mode into Settings module.
*   [ ] **Frustration Detection:** Tone analysis and empathetic response injection.
*   [ ] **Proactive Nudges:** Suggested cheat sheets and past issue follow-ups.
*   [ ] **Peer Knowledge Linking:** Context injection for user collaboration.
*   [ ] **Reminders Engine:** Persistent and scheduled tasks with notifications.
*   [ ] **Keyboard Shortcuts:** Power-user accessibility layer.

### Phase 9: Final Evolution (v2.0.0) - PLANNED
*   [ ] Vision: Image Analysis and Document OCR (Tesseract).
*   [ ] Self-Correction Memory: Background response grading.
*   [ ] Full ETL data migration from Felicia to Momo.
*   [ ] Final system-wide performance audit and cutover.

---

## 4. Disaster Recovery & Total Rebuild Protocol
*(See v1.6.0 for full details)*

---

## 5. Maintenance Edict
*   **Commit Policy:** Commit and push to GitHub after every verified functional change.
*   **Doc Policy:** Update this roadmap file with contextual versions.

---

## 6. Version History
*   **v1.7.0:** 90% legacy parity reached.
*   **v1.8.0:** Operational focus. Persistent History and Budget tracking live.
*   **v1.8.1:** Long-term Memory and Background Extraction verified.
*   **v1.8.2 (2026-03-05):** Audit complete. Initiated porting of Contextual Logic (Frustration, Nudges, Peer Linking).
