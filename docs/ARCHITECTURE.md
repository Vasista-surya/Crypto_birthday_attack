# Architecture Document

## System Overview

The Birthday Attack Lab is a full-stack educational web application demonstrating birthday attacks on cryptographic hashes. It consists of a Python/FastAPI backend and a React/TypeScript frontend, communicating via REST + Server-Sent Events (SSE).

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ 8 Module     │  │ Custom Hooks │  │ API Client (fetch/   │  │
│  │ Pages        │──│ (useSimulation│──│ EventSource)         │  │
│  │              │  │ useTheory,   │  │                       │  │
│  │              │  │ useCompare)  │  │                       │  │
│  └──────────────┘  └──────────────┘  └──────────┬────────────┘  │
└─────────────────────────────────────────────────┼────────────────┘
                                                  │ HTTPS/WS
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ REST API     │  │ SSE Endpoint │  │ Simulation Manager   │  │
│  │ (/api/*)     │──│ (/stream)    │──│ (asyncio tasks,      │  │
│  │              │  │              │  │  cancellation)       │  │
│  └──────────────┘  └──────────────┘  └──────────┬────────────┘  │
└─────────────────────────────────────────────────┼────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  birthday_lab Core (Pure Python)                │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ core.py          │  │ theory.py        │                    │
│  │ - truncate_sha256│  │ - birthday_bound │                    │
│  │ - random_message │  │ - expected_trials│                    │
│  │ - find_collision │  │ - collision_prob │                    │
│  │ - compare_messages│ │ - formulas (LaTeX)│                   │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Backend (`backend/`)

#### `birthday_lab/` — Framework-Independent Core
**Purpose**: Pure cryptographic logic extracted from the notebook, zero framework dependencies.

| Module | Responsibility | Key Functions |
|--------|----------------|---------------|
| `core.py` | Hashing, truncation, collision search, message comparison | `truncate_sha256()`, `random_message()`, `find_collision()`, `compare_messages()` |
| `theory.py` | Mathematical formulas (single source of truth) | `birthday_bound_50pct()`, `expected_trials()`, `collision_probability()`, LaTeX formulas |
| `__init__.py` | Public API exports | Re-exports core functions |

**Design Principles**:
- No FastAPI, no Pydantic, no async — pure synchronous Python
- Preserves notebook algorithms exactly (MSB truncation via right-shift, distinct-message check)
- Seeded reproducibility via `random.Random(seed)`
- Memory safety: caps `seen` dict at `min(2^bits, 10_000_000)`

#### `app/` — FastAPI Application Layer
| Module | Responsibility |
|--------|----------------|
| `main.py` | App factory, lifespan, CORS, global exception handler |
| `schemas.py` | Pydantic v2 request/response models |
| `services.py` | `SimulationManager` (async task lifecycle, SSE streaming) |
| `api/simulations.py` | POST `/simulations`, GET `/simulations/{id}/stream`, POST `/simulations/{id}/stop` |
| `api/compare.py` | POST `/compare` |
| `api/theory.py` | GET `/theory`, GET `/theory/series`, POST `/theory/batch` |
| `api/health.py` | GET `/health` |

**SSE Streaming Design**:
- Generator-based: `find_collision()` yields `AttemptSnapshot` or `CollisionResult`
- `SimulationManager` runs generator in thread pool, updates state
- `/stream` endpoint uses `EventSourceResponse` with `addEventListener`
- Throttled updates: every 50 attempts or 100ms
- Cancellation via `asyncio.Task.cancel()`

**Limits & Safety**:
- Max bits: 32 (enforced in schema + core)
- Max attempts: 1,000,000 (configurable)
- Max concurrent simulations: 10
- Auto-cleanup of completed simulations (5 min TTL)
- Rate limiting: TODO (recommend nginx/proxy level)

### Frontend (`frontend/`)

#### Architecture
```
src/
├── main.tsx              # Entry point, Router, StrictMode
├── App.tsx               # Routes, Layout wrapper
├── components/
│   ├── Layout.tsx        # Header, nav, theme, progress bar, footer
│   ├── Common.tsx        # Card, Section, Callout, Badge, HashDisplay, CopyButton, Toast, Skeleton, LoadingSpinner
│   ├── BirthdayParadox.tsx    # Interactive paradox (Module 1)
│   ├── MathFormula.tsx        # KaTeX wrapper with reading/expansion
│   └── index.ts
├── pages/                # One per module (8 total)
│   ├── Overview.tsx      # Module 1: Learn
│   ├── Simulation.tsx    # Module 2: Experiment
│   ├── Compare.tsx       # Module 3: Analyse
│   ├── Theory.tsx        # Module 4: Theory
│   ├── Walkthrough.tsx   # Module 5: Walkthrough
│   ├── RealWorld.tsx     # Module 6: Apply
│   ├── Security.tsx      # Module 7: Review
│   └── About.tsx         # Module 8: About
├── charts/
│   ├── AttackProgressChart.tsx    # Recharts line chart + data table
│   ├── TheoryChart.tsx            # Recharts log-scale multi-line
│   └── HistogramChart.tsx         # Recharts bar chart + stats
├── hooks/
│   ├── useSimulation.ts   # SSE lifecycle, progress/result state
│   ├── useComparison.ts   # POST /compare
│   └── useTheory.ts       # GET /theory, /theory/series, POST /theory/batch
├── lib/
│   └── api.ts             # Typed fetch/EventSource wrappers
├── content/               # Educational data (separated from UI)
│   ├── overview.ts
│   ├── realWorldCases.ts
│   ├── security.ts
│   ├── knowledgeChecks.ts
│   ├── facultyQA.ts
│   └── index.ts
└── styles/
    └── globals.css        # Tailwind + custom components
```

#### State Management
- **React hooks** for all async state (no Redux/Zustand needed)
- `useSimulation`: Manages SSE connection, progress, result, theory
- `useComparison`: Single POST request/response
- `useTheory`: Fetches theory, series, runs batch experiments

#### UI/UX Design System
| Aspect | Implementation |
|--------|----------------|
| **Theme** | Dark-mode-first (CSS custom properties), light mode via `.light` class |
| **Colors** | Ink (slate), Teal (cool accent/match), Amber (warm accent/collision) |
| **Typography** | Inter (sans), JetBrains Mono (mono) via Google Fonts |
| **Components** | Tailwind utility classes + `@layer components` for `.btn`, `.card`, `.input`, etc. |
| **Animations** | Framer Motion for page transitions, stepper, chart lines; respects `prefers-reduced-motion` |
| **Charts** | Recharts with accessibility data tables |
| **Math** | KaTeX with plain-language readings + worked examples |
| **Accessibility** | ARIA live regions (polite) for SSE progress, semantic HTML, focus rings, color-contrast, keyboard nav |

### Data Flow Examples

#### 1. Start Simulation → Stream Progress → Show Result
```
User clicks "Start" (16 bits, seed=42)
    │
    ▼
POST /api/simulations {bits:16, seed:42}
    │
    ▼
SimulationManager.start_simulation()
    │
    ▼
asyncio.create_task(_consume_generator)
    │
    ▼
find_collision(bits=16, seed=42)  ──yields──▶ AttemptSnapshot (every 50 attempts/100ms)
    │                                              │
    │                                              ▼
    │                                    SSE "progress" event
    │                                              │
    │                                              ▼
    │                                    useSimulation.onProgress()
    │                                              │
    │                                              ▼
    │                                    React state update → UI re-render
    │
    ▼ (collision found)
find_collision yields CollisionResult
    │
    ▼
SSE "result" event
    │
    ▼
useSimulation.onResult() → setResult() → setStatus('completed')
    │
    ▼
UI shows collision card, progress chart, both messages, full digests, truncation banner
```

#### 2. Message Comparison
```
User enters two messages, selects bits, clicks "Compare"
    │
    ▼
POST /api/compare {message1, message2, bits}
    │
    ▼
compare_messages_service() → compare_messages() (core)
    │
    ▼
Returns CompareResponse with full/truncated digests, match flags, explanation
    │
    ▼
useComparison.onResult() → setResult()
    │
    ▼
UI shows verdict badges, adaptive explanation, both digests with highlighted truncation
```

#### 3. Theory Data for Charts
```
Theory page mounts → useEffect → fetchTheory(16) + fetchSeries(8,32)
    │
    ▼
GET /api/theory?bits=16 → TheoryResponse (both metrics, formulas, readings, worked example)
GET /api/theory/series?min_bits=8&max_bits=32 → TheorySeriesResponse
    │
    ▼
useTheory sets theory + series state
    │
    ▼
TheoryChart receives series data → renders log-scale lines
HistogramChart receives batch data → renders bars + stats
```

## Security Architecture

### Cryptographic Honesty Enforcement
| Layer | Mechanism |
|--------|-----------|
| **Core** | `truncate_sha256()` only accepts 1-32 bits (web) or 1-256 (compare); never full 256 collision |
| **API** | `SimulationStartRequest.bits` max=32; `CompareRequest.bits` max=256 but UI caps at 32 |
| **UI** | Permanent banner: "Collision found in truncated n-bit output only. Full SHA-256 digests are different." |
| **Compare** | Explicit verdicts: "FULL SHA-256 COLLISION FOUND" (impossible) vs "TRUNCATED COLLISION" |
| **Documentation** | Every module README, About page, footer disclaimer |

### Input Validation
- Message length: max 10KB (schema)
- Bits: 1-32 for simulation, 1-256 for compare (schema)
- Seed: optional integer (schema)
- UTF-8 encoding enforced (core)

### SSE Security
- No authentication (educational demo) — add auth for production
- CORS restricted via `CORS_ORIGINS` env var
- Connection timeouts: 86400s read/send for long simulations
- Auto-cleanup prevents resource exhaustion

## Testing Strategy

### Backend (`backend/tests/`)
| Test File | Coverage |
|-----------|----------|
| `test_core.py` | Unit tests: truncation, formulas, RNG, comparison, collision search structure |
| `test_parity.py` | **Parity tests**: algorithmic match with notebook (truncation method, formulas, collision logic, seed determinism) |
| `pytest.ini` | asyncio_mode=auto, test discovery config |

**Parity Verification**: 44 tests pass including:
- MSB truncation via right-shift matches notebook exactly
- Birthday bound formula: `√(2·2ⁿ·ln2)` exact
- Collision detection requires distinct messages
- Seed 42 produces deterministic collision at 16 bits
- Attempt history tracking matches notebook behavior

### Frontend (`frontend/src/`)
| Test Type | Tool |
|-----------|------|
| Unit | Vitest + React Testing Library |
| E2E (smoke) | Playwright (optional, configured in vitest) |
| Lint | ESLint + TypeScript strict mode |

## Deployment Architecture

### Development
```
docker-compose.yml
├── backend:  uvicorn --reload (port 8000)
└── frontend: npm run dev (port 5173, proxies /api to backend)
```

### Production (Single Server)
```
docker-compose.prod.yml
├── backend:  uvicorn --host 0.0.0.0 --port 8000
└── frontend: nginx (serves dist/, proxies /api to backend)
```

### Separate Deployments
| Component | Platform | Config |
|-----------|----------|--------|
| Frontend | Vercel/Netlify | `VITE_API_BASE=https://api.domain.com/api` |
| Backend | Render/Railway/Fly.io | `CORS_ORIGINS=https://app.domain.com` |

### Kubernetes (Outline)
- Backend: Deployment (2+ replicas), Service, HPA (CPU > 70%)
- Frontend: Deployment, Service, Ingress with TLS
- Shared: ConfigMap for env vars, Secret for any keys

## Extensibility Points

| Extension Point | Description |
|-----------------|-------------|
| **New hash algorithms** | Add to `core.py` with same interface; update UI bits selector |
| **Advanced attacks** | Floyd cycle-finding, chosen-prefix — add to core, expose via new API endpoints |
| **Batch experiments** | Already implemented via `/theory/batch`; extend with more stats |
| **User accounts** | Add auth middleware, persist simulation history to DB |
| **Real-time collaboration** | WebSocket for shared simulation sessions |
| **Export/Import** | Add JSON export of simulation results, charts |

## Performance Characteristics

| Operation | Complexity | Typical Time (16-bit) |
|-----------|------------|----------------------|
| Single hash | O(1) | < 1 μs |
| Collision search | O(2^(n/2)) | ~10-50 ms (300 attempts) |
| SSE streaming | O(attempts) | Throttled to 10 Hz |
| Chart render | O(data points) | < 50 ms (Recharts) |

### Memory
| Bit Size | Expected Entries | Approx. Memory |
|----------|------------------|----------------|
| 8 | ~19 | < 1 KB |
| 16 | ~301 | ~10 KB |
| 24 | ~5,100 | ~200 KB |
| 32 | ~65,000 | ~3 MB |
| 48 (notebook) | ~4M | ~200 MB |

## Monitoring & Observability

### Health Checks
- `GET /api/health` → `{"status":"ok","service":"Birthday Attack Lab API","version":"1.0.0"}`
- Frontend: nginx returns 200 for `/`

### Recommended Metrics
- Active simulations count
- SSE connections open
- Simulation duration (histogram)
- Collision found rate
- Memory usage per simulation
- API latency (p50, p95, p99)

### Logging
- Structured JSON logs (configure uvicorn `--log-config`)
- Correlation IDs for request tracing
- Error tracking (Sentry compatible)

## Future Improvements

1. **Authentication** — JWT/OAuth for multi-user deployments
2. **Persistence** — PostgreSQL for simulation history, user progress
3. **Rate Limiting** — Token bucket per IP on `/api/simulations`
4. **WebSocket Alternative** — For bidirectional communication
5. **Internationalization** — i18n for educational content
6. **Offline Mode** — Service worker + Web Crypto API for client-only demos
7. **Advanced Visualizations** — 3D collision space, differential path viewer

---

*Architecture version: 1.0*  
*Last updated: 2026-10-12*  
*Branch: vasista*