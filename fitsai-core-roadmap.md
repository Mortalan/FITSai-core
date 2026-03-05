# FITSai-Core (Codename: Momo) Master Blueprint & Roadmap

**Version:** 1.6.1 (Self-Awareness & Routing Complete)
**Date:** 2026-03-05
**Objective:** To build a from-the-ground-up autonomous agentic ecosystem (Momo) that completely replaces and exceeds the legacy system (Felicia). Momo is an agent-first platform designed for enterprise autonomy, featuring a sleek minimalist UI, a stateful agentic brain, and full parity with all legacy features.

---

## 1. System Vision & Architecture

### 1.1 The Agent-First Core
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
*   **Routing Engine:** 3-Tier AI Router (Tier 1: Templates, Tier 2: Local Mistral, Tier 3: OpenAI).
*   **Database:** PostgreSQL (SQLAlchemy 2.0), ChromaDB (Vector), Redis (State/Queue).
*   **Security:** JWT, OAuth2, AES-256-GCM encryption, TLS 1.3.

### 2.2 Frontend (The Portal)
*   **Framework:** **React 19** + **TypeScript**.
*   **Style:** **Tailwind CSS v4** + **Shadcn UI**.
*   **Graphics:** **Three.js** (for Holographic Avatar).
*   **State:** Zustand (UI) + TanStack Query (Server).
*   **Real-time:** WebSockets/SSE for agent observation and notifications.

---

## 3. Implementation Phases (The Porting Guide)

### Phase 1: Core Scaffolding (v1.1.0) - COMPLETE ✅
*   [x] Initialize Monorepo structure and GitHub Sync.
*   [x] Backend: FastAPI + Auth + Postgres/Alembic setup.
*   [x] Frontend: React 19 + Tailwind v4 + Gemini layout.
*   [x] Initial Database Schema (Users table).

### Phase 2: Agentic Engine & Sleek UI (v1.2.0) - COMPLETE ✅
*   [x] LangGraph state-machine implementation.
*   [x] Real-time Streaming API (SSE).
*   [x] Premium Agent Visibility (Action Cards with tool diffs).
*   [x] Authentication & Identity integration (JWT).

### Phase 3: Gamification & Avatars (v1.3.0) - COMPLETE ✅
*   [x] Port User XP and Leveling system (50-level tiers).
*   [x] Re-implement Achievement engine (100+ badges).
*   [x] Character Class Progression (Kobold to BDFL).
*   [x] Progress Dashboard in Sidebar.

### Phase 4: Knowledge & SOPs (v1.4.0) - COMPLETE ✅
*   [x] Document Storage & Versioning Database Schema.
*   [x] Knowledge Base (SOP) Library UI (List, Read, Create).
*   [x] Autonomous SOP Creation/Reading via Agentic Tools.

### Phase 5: Enterprise Tools (v1.5.0) - IN PROGRESS 🔄
*   [x] GHL (GoHighLevel) Service and Contact Lookup tool.
*   [x] GLPI Asset Management Service and Search tool.
*   [x] Multi-tenant / White-labeling foundation (Department model).
*   [ ] Department & Project Management isolation.

### Phase 6: Local AI & 3-Tier Routing (v1.6.0) - COMPLETE ✅
*   [x] 3-Tier Router implementation (Tier 1: Fast, Tier 2: Mini, Tier 3: Complex).
*   [x] Automatic Model Selection (GPT-4o vs GPT-4o-mini).
*   [x] Instant Tier 1 Greeting handling.
*   [x] Ported 31 Natural Personality modes (Scaffolded).

### Phase 7: Holographic Avatar & Interaction (v1.7.0) - PLANNED
*   [ ] Port V.I.K.I.-style 3D Holographic Avatar (Three.js).
*   [ ] Implement Mouse Tracking and State-based shaders.
*   [ ] Level-based visual upgrades (Glow, Particles, Cosmic effects).
*   [ ] Avatar Customization UI (Colors, Effects).

### Phase 8: Voice & Multi-Modal (v1.8.0) - PLANNED
*   [ ] Speech-to-Text Integration (Whisper).
*   [ ] Text-to-Speech Integration (OpenAI + Piper Fallback).
*   [ ] WebSocket-based Voice Chat implementation.
*   [ ] Vision: Image Analysis and Document OCR (Tesseract).

### Phase 9: Management & Monitoring (v1.9.0) - COMPLETE ✅
*   [x] System Monitoring Service (Self-Awareness).
*   [x] Autonomous `system_report` tool for real-time metrics.
*   [ ] Daily Briefing Card & Reminders.
*   [ ] Budget Tracking & Usage Projections.

### Phase 10: Final Data Migration & Cutover (v2.0.0) - PLANNED
*   [ ] Full ETL data migration from Felicia to Momo.
*   [ ] Final system-wide performance audit.
*   [ ] Deprecate Felicia ports and re-route to Momo production.

---

## 4. Disaster Recovery & Total Rebuild Protocol
*(See v1.6.0 for full details)*

---

## 5. Maintenance Edict
*   **Commit Policy:** Commit and push to GitHub after every verified functional change.
*   **Doc Policy:** Update this roadmap file with contextual versions.

---

## 6. Version History
*   **v1.0.0 - v1.5.0:** Initial build and porting.
*   **v1.6.0 (2026-03-05):** Comprehensive Roadmap Audit. 3-Tier Routing implemented.
*   **v1.6.1 (2026-03-05):** Self-Awareness (Phase 9) and 3-Tier Routing (Phase 6) end-to-end verified.
