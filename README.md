# Birthday Attack Lab

> An interactive cryptography laboratory for learning about birthday attacks on cryptographic hashes.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Vasista-surya/Crypto_birthday_attack)
[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## Overview

The **Birthday Attack Lab** is a professional educational web application that demonstrates the birthday paradox applied to cryptographic hash functions. Built from an academic case study, it provides hands-on experience with collision search, theoretical analysis, and real-world attack case studies.

### Key Features

| Module | Description |
|--------|-------------|
| **1. Learn** | Interactive birthday paradox, hash function fundamentals, collision vs preimage complexity |
| **2. Experiment** | Live collision search with SSE streaming, configurable bits (8-32), seed reproducibility |
| **3. Analyse** | Two-message comparison with full/truncated verdicts and adaptive explanations |
| **4. Theory** | Dual metrics (50% bound & expected trials), log-scale effort curves, multi-run histograms |
| **5. Walkthrough** | 6-step animated attack process, resistance comparison table |
| **6. Apply** | 5 real-world cases (MD5 rogue CA, Flame, SHAttered, SHA-1 Shambles, Sweet32) with lab-difference callouts |
| **7. Review** | Algorithm comparison, countermeasures, 12 knowledge checks, 15 faculty Q&A |
| **8. About** | Limitations, traceability matrix, credits, references |

### Cryptographic Honesty

> **This lab demonstrates collisions ONLY in deliberately truncated SHA-256 outputs.** It never claims or implies that finding a collision in a truncated digest means full SHA-256 is broken. Every result view displays: *"Collision found in the truncated n-bit output only. Full SHA-256 digests are different."*

## Screenshots

| Module | Preview |
|--------|---------|
| **Simulation** | Live collision search with real-time progress |
| **Compare** | Side-by-side hash comparison with highlighted truncation |
| **Theory** | Log-scale curves: preimage (2ⁿ) vs collision (2ⁿᐟ²) |
| **Walkthrough** | Animated step-by-step attack process |
| **Real World** | Historical attack cards with explicit distinctions |

*(Add actual screenshots/GIFs here after manual verification)*

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Or: Python 3.11+, Node 20+

### Local Development

```bash
git clone https://github.com/Vasista-surya/Crypto_birthday_attack
cd Crypto_birthday_attack

# With Docker (recommended)
docker-compose up -d

# Or manually:
# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

**Access:**
- Frontend: http://localhost (or http://localhost:5173 for dev)
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

## Architecture

```
├── backend/                 # FastAPI + Python
│   ├── app/
│   │   ├── api/            # REST endpoints + SSE
│   │   ├── schemas/        # Pydantic models
│   │   └── services/       # Simulation manager
│   ├── birthday_lab/       # Framework-independent core (parity-verified)
│   │   ├── core.py         # Hashing, truncation, collision search
│   │   └── theory.py       # Mathematical formulas (single source of truth)
│   └── tests/              # 44 tests including notebook parity
│
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # Reusable UI (charts, formulas, layout)
│   │   ├── pages/          # 8 module pages
│   │   ├── hooks/          # API hooks (SSE, REST)
│   │   ├── lib/            # API client
│   │   └── content/        # Educational text & Q&A data
│   └── public/
│
├── notebooks/              # Original academic sources (preserved)
│   ├── birthday_attack_step_by_step.ipynb
│   ├── Birthday_Attacks_Case_Study_Green.docx
│   └── birthday_attack.py
│
└── docs/                   # Documentation
    ├── NOTEBOOK_ANALYSIS.md
    ├── CONTENT_REVIEW.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── DEMO_SCRIPT.md
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, Uvicorn, SSE-Starlette |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, KaTeX, Framer Motion |
| **Testing** | pytest, Vitest, React Testing Library |
| **Deployment** | Docker, Docker Compose, nginx |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/simulations` | POST | Start collision search (bits, seed, max_attempts) |
| `/api/simulations/{id}/stream` | GET | SSE progress stream |
| `/api/simulations/{id}/stop` | POST | Cancel simulation |
| `/api/compare` | POST | Compare two messages (full + truncated) |
| `/api/theory?bits=n` | GET | Theoretical metrics (50% bound, expected trials) |
| `/api/theory/series` | GET | Chart data for effort vs bits |
| `/api/theory/batch` | POST | Multi-run experiment |
| `/api/health` | GET | Health check |

## Testing

```bash
# Backend
cd backend && python -m pytest -v

# Frontend
cd frontend && npm test

# All tests
docker-compose run --rm backend pytest
docker-compose run --rm frontend npm test
```

**Backend Results:** 44/44 passing (including parity tests against notebook logic)

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Single-server Docker Compose
- Separate frontend/backend (Vercel/Netlify + Render/Railway/Fly.io)
- Kubernetes manifests
- SSL/TLS with Let's Encrypt
- Monitoring & scaling

## Educational Use

### For Instructors
- **Demo Script**: [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — 8-10 minute walkthrough
- **Faculty Q&A**: 15 likely review questions with model answers (Module 7)
- **Traceability**: Every feature tagged [Notebook]/[Report]/[Proposed]

### For Students
1. Start with **Learn** (Module 1) for concepts
2. Run **Experiment** (Module 2) with 16-bit default
3. Try **Compare** (Module 3) with your own messages
4. Analyze **Theory** (Module 4) charts
5. Follow **Walkthrough** (Module 5) step-by-step
6. Study **Real World** (Module 6) case studies
7. Test knowledge in **Review** (Module 7)

## Source Materials

| Source | Description |
|--------|-------------|
| `Birthday_Attacks_Case_Study_Green.docx` | Full academic report (abstract, background, paradox, methodology, incidents, demonstrations, countermeasures) |
| `birthday_attack_step_by_step.ipynb` | Reference implementation (collision search, message comparison, theory, visualization) |
| `birthday_attack.py` | CLI version of notebook logic |

All preserved in `/notebooks/` directory.

## Parity Verification

The refactored `birthday_lab` core was verified against the original notebook:
- ✅ Truncation method (MSB via right-shift) identical
- ✅ Collision detection with distinct-message check preserved
- ✅ Birthday bound formula: `√(2·2ⁿ·ln2)` exact match
- ✅ Random message generation (charset, length) identical
- ✅ Seeded reproducibility confirmed

See `backend/tests/test_parity.py` for test details.

## Limitations

1. **Truncated digests only** — no full SHA-256 collision
2. **Random search only** — no differential cryptanalysis
3. **Memory-bounded** — web max 32 bits, notebook max 24 bits
4. **Probabilistic results** — single runs vary; theory gives expectations
5. **Educational demonstration** — not a replication of real attacks

## License

MIT License — see [LICENSE](LICENSE) for details.

## Credits

- **Academic Source**: 23CSE331 Cryptography Case Study (2026-27)
- **References**: Yuval 1979, Wang & Yu 2005, Stevens et al. 2009/2017, Leurent & Peyrin 2020, Bhargavan & Leurent 2016
- **Standards**: NIST FIPS 180-4, FIPS 202, SP 800-106, RFC 6151

---

**Repository**: https://github.com/Vasista-surya/Crypto_birthday_attack  
**Branch**: `vasista` (development) → `main` (stable)