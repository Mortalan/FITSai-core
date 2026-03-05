# FITSai-Core (Codename: Momo) Master Blueprint & Roadmap

**Version:** 1.5.0 (Enterprise Integration Phase)
**Date:** 2026-03-05
**Objective:** To build Momo in total isolation on the same production server as Felicia, ensuring zero interruption to legacy users while maintaining state resilience.

---

## 1. System Vision & Architecture

### 1.1 The "Agent-First" Core
Momo is built as a **Stateful Agentic Graph**. 
*   **Logic Engine:** **LangGraph**. Provides a robust state-machine for multi-turn reasoning loops.
*   **Composability:** Component-based design.
*   **Isolated Evolution:** Momo is developed in total isolation.

### 1.2 Architectural Principles
*   **Monorepo Structure:** `/backend`, `/frontend`, `/cli`, `/shared`.
*   **Performance First:** Async-native FastAPI backend.
*   **Gemini-Inspired Design:** Minimalist, sleek UI. Focus on high contrast and premium typography.

---

## 2. Technical Stack

### 2.1 Backend (The Brain)
*   **Framework:** Python 3.12+ with **FastAPI**.
*   **Orchestration:** **LangGraph** (with persistent Checkpointers).
*   **Database:** PostgreSQL (Relational), ChromaDB (Vector), Redis (State).
*   **Tooling:** Native MCP support.

### 2.2 Frontend (The Portal)
*   **Framework:** React 19 + TypeScript.
*   **Style:** Tailwind CSS v4 + Shadcn UI.
*   **State:** Zustand (UI) + TanStack Query (Server).

---

## 3. Implementation Progress

### Phase 1: Core Scaffolding (v1.1.0)
*   [x] Initialize Monorepo structure.
*   [x] Backend: FastAPI + Auth + Postgres/Alembic setup.
*   [x] Frontend: React 19 + Tailwind v4 + Shadcn.

### Phase 2: Agentic Engine & Sleek UI (v1.2.0)
*   [x] LangGraph state-machine implementation.
*   [x] Core Tool Set (File system).
*   [x] Real-time Streaming API (SSE).
*   [x] Gemini-style Minimalist UI (Refined for readability).
*   [x] Authentication & Identity integration (JWT).
*   [x] Premium Agent Visibility (Action Cards).

### Phase 3: Gamification & Avatars (v1.3.0)
*   [x] Port User XP and Leveling system.
*   [x] Re-implement Achievement engine (Modular).
*   [x] Dynamic Avatar System (Animated thinking/speaking states).
*   [x] Progress Dashboard in Sidebar.

### Phase 4: Document Management (v1.4.0)
*   [x] Document Storage & Versioning Database Schema.
*   [x] Knowledge Base (SOP) Library UI (List, Read, Create).
*   [x] Autonomous SOP Creation/Reading via Agentic Tools.

### Phase 5: Enterprise Integrations (v1.5.0) - IN PROGRESS
*   [x] GoHighLevel (GHL) Service Implementation.
*   [x] GLPI Asset Management Service Implementation.
*   [ ] Multi-tenant White-labeling support.
*   [ ] GHL Lead Sync Tool.
*   [ ] GLPI Ticket Resolution Tool.

---

## 4. Version History
*   **v1.0.0:** Initial concept.
*   **v1.1.0:** Finalized Agent-First architecture and Monorepo.
*   **v1.2.0:** Phase 2 Complete. Momo Brain and Sleek UI live.
*   **v1.3.0:** Gamification and Avatars ported.
*   **v1.4.0:** Phase 4 Complete. Autonomous SOPs and Polish verified.
*   **v1.5.0 (2026-03-05):** Initiated Phase 5. Enterprise services (GHL/GLPI) initialized and tools defined.
