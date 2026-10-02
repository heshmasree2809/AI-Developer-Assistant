# AI Developer Assistant (DevPulse Studio)

> **Enterprise-Grade AI Code Intelligence, Automated Static & Semantic Review, Security Bug Detection, Refactoring Engine, Unit Test Generator, and Multi-Format Audit Reporting Platform.**

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-3.7_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary

**AI Developer Assistant** is a full-stack developer productivity platform engineered to automate modern software engineering workflows. Built with a **React 19** frontend and a **Node.js/Express TypeScript** backend, it integrates **Google Gemini GenAI** with an adaptive multi-model failover engine to inspect codebases, surface architectural vulnerabilities, generate unit tests, optimize performance, and export client-ready executive reports in Word, PowerPoint, PDF, Markdown, and HTML formats.

Designed for engineering leads, code reviewers, and software engineers, this tool eliminates repetitive code review overhead and catches critical defects before code merges into production.

---

## 🎯 Quick Links & Recruiter Snapshot

| Key Metric | Details |
| :--- | :--- |
| **Role Targeted** | Full-Stack Engineer / Frontend Engineer / AI Application Engineer |
| **Core Architecture** | React 19 SPA + Express 4 TypeScript API + Vite 6 Middleware + Gemini GenAI SDK |
| **Key Engineering Highlights** | Zero-downtime AI model failover, JWT auth, in-memory DB, multi-format binary/HTML document generator |
| **Languages Supported** | Python, TypeScript, JavaScript, Java, Go, Rust, C++, C#, PHP, SQL, Ruby |
| **Audit Exporters** | Microsoft Word (`.doc`), PowerPoint (`.ppt`), Print-Ready PDF (`.pdf`), Markdown (`.md`), HTML (`.html`), JSON (`.json`) |

---

## 🚀 Key Features

### 1. 🔍 Automated Deep Code Review
- **Multi-Vector Assessment**: Analyzes code quality, security postures, algorithmic efficiency, architectural patterns, and adherence to language-specific standards.
- **Dynamic Scorecard**: Provides an overall health score (0–100) with color-coded grading and categorized findings.
- **Interactive Issue Filtering**: Filter review issues in real time by severity (`Critical`, `Warning`, `Info`), category (`Security`, `Performance`, `Style`, `Architecture`), or free-text search.

### 2. 🛡️ Bug Detection & Vulnerability Scanner
- **Root Cause Identification**: Detects syntax defects, concurrency hazards, memory leaks, unhandled edge cases, and SQL/XSS injection vulnerabilities.
- **One-Click Automated Fixes**: Provides side-by-side proposed fixes and explanations with unified diff visualizations.

### 3. ⚡ Intelligent Refactoring & Modernization
- **Clean Architecture & SOLID Alignment**: Transforms legacy imperative routines into modern, idiomatic, testable patterns.
- **Diff Comparison View**: Direct side-by-side or inline view comparing original versus modernized code with change summaries.

### 4. 🧪 Automated Unit Test Generation
- **Framework-Aware Test Suites**: Generates tests for industry-standard test runners (`pytest`, `Jest`, `JUnit`, `Go test`, `xUnit`, etc.).
- **Boundary & Edge-Case Coverage**: Incorporates happy paths, edge cases, error conditions, and mocks.

### 5. 📚 Comprehensive Technical Documentation
- **API & Function Specifications**: Automatically produces structured docstrings (JSDoc, PEP 257), parameter types, return contracts, and architectural overviews.
- **Markdown Documentation**: Generates developer guides and README sections directly from source logic.

### 6. 💡 Interactive Algorithm & Code Explainer
- **Step-by-Step Logic Dissection**: Explains complex algorithms in plain English for code reviews and team onboarding.
- **Complexity Analysis**: Computes Big-O Time and Space complexity metrics with optimization strategies.

### 7. 📄 Multi-Format Executive Audit Exporter
Export reports to any corporate workflow with zero external server dependencies:
- **Microsoft Word (`.doc`)**: Formatted reports with cover sheets, metadata tables, executive summaries, scorecards, and styled code blocks.
- **PowerPoint Presentation (`.ppt`)**: Presentation-ready slides summarizing audit findings, issue breakdowns, and key recommendations.
- **Print-Ready PDF**: Browser-optimized printable document with custom stylesheets.
- **Markdown (`.md`)**: GitHub-ready documentation and PR review summaries.
- **Clean Standalone HTML (`.html`)**: Self-contained web view with responsive styling.
- **Machine-Readable JSON (`.json`)**: Raw payload for CI/CD integration.

### 8. 📊 Analytics Dashboard & Audit History
- **Metric Visualizations**: Real-time charts powered by Recharts tracking quality score distributions, language activity, and issue severity trends.
- **Persistent History**: Searchable, filterable audit log linked to specific workspaces and projects.

### 9. 🗂️ Project & Workspace Management
- Organize reviews into multi-file projects with custom tags and file-level inspection.
- Secure user authentication using **JWT** and **bcrypt** password hashing with optional guest/trial access.

---

## 🏗️ Architecture & Technical Design

```
                  +----------------------------------------------+
                  |               Client Browser                 |
                  |  React 19 + TypeScript + Tailwind CSS v4     |
                  +----------------------------------------------+
                                         |
                                         | HTTP / REST (Axios)
                                         v
                  +----------------------------------------------+
                  |         Node.js Express TypeScript API       |
                  |     (Vite Middleware Dev / CJS Dist Prod)    |
                  +----------------------------------------------+
                         |                       |
          +--------------+                       +---------------+
          |                                                      |
          v                                                      v
+-------------------+                                  +-------------------+
|  In-Memory Store  |                                  |   AI Resilience   |
|   (Users, JWT,    |                                  |   Failover Engine |
| Projects, History)|                                  +-------------------+
+-------------------+                                            |
                                              +------------------+------------------+
                                              |                                     |
                                              v                                     v
                                    +--------------------+                +--------------------+
                                    | Google Gemini API  |                | Heuristic Fallback |
                                    | (gemini-3.7-flash, |   (Failover)   | Static Analyzer    |
                                    | gemini-3.1-lite)   | -------------> | (Zero-Downtime)    |
                                    +--------------------+                +--------------------+
```

### Resilient AI Failover Engine
Production systems cannot afford downtime due to model deprecation, rate limits, or upstream outages. DevPulse Studio implements:
1. **Automated Deprecated Model Filtering**: Intercepts outdated model IDs (`gemini-2.5-flash`, `gemini-1.5-*`, `gemini-2.0-*`) and automatically redirects requests to modern endpoints (`gemini-3.7-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`).
2. **Cascading Model Fallback**: Tries alternate candidates upon receiving `404 Not Found`, `503 High Demand`, or `429 Quota Exceeded` errors.
3. **Offline Heuristic Engine**: If an API key is missing or upstream connectivity is interrupted, the platform falls back to an embedded heuristic static analyzer to guarantee uninterrupted demonstrations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5.8, Tailwind CSS v4, Lucide Icons, Recharts, Framer Motion |
| **Backend** | Node.js, Express.js 4.21, TypeScript, `tsx`, `jsonwebtoken`, `bcryptjs` |
| **AI / LLM** | `@google/genai` SDK, Google Gemini 3.7 Flash, Gemini 3.1 Flash-Lite |
| **Formatting & Utilities** | `prettier`, `js-beautify`, `canvas-confetti`, `axios` |
| **Build & Tooling** | Vite 6, esbuild, TypeScript compiler (`tsc`) |

---

## 🔌 API Reference

### Authentication
- `POST /api/auth/register` — Register a new user account (returns JWT & user payload)
- `POST /api/auth/login` — Authenticate existing user credentials
- `GET /api/users/me` — Retrieve profile for current authenticated user

### Project Management
- `GET /api/projects` — List all projects for authenticated user
- `POST /api/projects` — Create a project (`name`, `description`, `tags`)
- `GET /api/projects/:id` — Get project details and associated files
- `PUT /api/projects/:id` — Update project metadata
- `DELETE /api/projects/:id` — Delete project and associated records
- `POST /api/projects/:id/files` — Add a source file to a project
- `DELETE /api/projects/:id/files/:fileId` — Delete a file from a project

### AI Analysis Suite
- `POST /api/analysis/review` — Run deep code quality review
- `POST /api/analysis/bugs` — Scan source code for bugs and security vulnerabilities
- `POST /api/analysis/refactor` — Generate architectural refactoring recommendations
- `POST /api/analysis/tests` — Generate framework-specific unit test suites
- `POST /api/analysis/documentation` — Generate docstrings, function contracts, and markdown docs
- `POST /api/analysis/explain` — Produce step-by-step logic breakdown & Big-O complexity

### History & Analytics
- `GET /api/analysis/history` — Query past analyses with language, type, and keyword filters
- `GET /api/analysis/:id` — Retrieve full historical audit record
- `DELETE /api/analysis/:id` — Delete historical audit record
- `GET /api/stats` — Retrieve aggregated metrics and activity trends
- `GET /api/health` — Service health check & LLM configuration status

---

## 💻 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **bun** / **yarn**
- *(Optional)* **Google Gemini API Key** ([Get a key here](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ai-developer-assistant.git
   cd ai-developer-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your configuration to `.env`:
   ```env
   # Application Port
   PORT=3000

   # JWT Security Key
   JWT_SECRET=your-secure-jwt-secret-here

   # Gemini API Credentials (Optional - platform has heuristic fallback)
   GEMINI_API_KEY=your_gemini_api_key_here
   LLM_MODEL=gemini-3.7-flash
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Production Build & Deployment

To generate an optimized production bundle:

```bash
# Compile client assets via Vite and bundle server via esbuild
npm run build

# Start the optimized Node.js server
npm run start
```

### Type Checking & Linting
```bash
npm run lint
```

---

## 💡 Why This Project Stands Out to Recruiters

1. **Production-Ready Full-Stack Architecture**: Demonstrates mastery of end-to-end TypeScript, combining a clean React 19 frontend with a robust Express backend.
2. **Defensive AI Engineering**: Rather than making naive LLM calls, the codebase incorporates model fallback cascades, deprecated model sanitization, and structured JSON parsing safeguards.
3. **Enterprise Value & Usability**: Solves real engineering problems with exportable Word/PowerPoint/PDF audit reports, test generation, and deep security analysis.
4. **Clean Code & Type Safety**: Strict TypeScript interfaces throughout data layers, API contracts, and UI components.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and adapt it for personal and commercial projects.
