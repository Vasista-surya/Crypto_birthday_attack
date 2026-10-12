# Notebook Analysis: `birthday_attack_step_by_step.ipynb`

## Cell-by-Cell Summary

| Cell # | Type | Description | Inputs | Outputs | Libraries Used | Formulas / Key Logic |
|--------|------|-------------|--------|---------|----------------|----------------------|
| 1 | Markdown | Title & rubric mapping | — | — | — | — |
| 2 | Markdown | Case study rubric mapping | — | — | — | — |
| 3 | Code (main) | Complete interactive CLI program | User menu choices, hash size selection | Console output, matplotlib plot | `hashlib`, `math`, `random`, `string`, `time`, `matplotlib.pyplot` | See detailed function breakdown below |

### Core Functions in the Notebook (Cell 3)

| Function | Purpose | Inputs | Outputs | Key Formulas / Logic |
|----------|---------|--------|---------|----------------------|
| `birthday_bound(bits)` | Theoretical 50% collision threshold | `bits: int` | `float` | `sqrt(2 * 2^bits * ln(2))` |
| `truncated_hash(message, bits)` | Compute truncated SHA-256 | `message: str`, `bits: int` | `int` (truncated value) | `int.from_bytes(sha256(message).digest(), "big") >> (256 - bits)` |
| `random_message(length=12)` | Generate random alphanumeric string | `length: int` (default 12) | `str` | `random.choice(string.ascii_letters + string.digits)` |
| `show_hash(message, bits)` | Format truncated hash as hex | `message: str`, `bits: int` | `str` (hex) | `truncated_hash()` then format with `(bits + 3) // 4` hex chars |
| `random_attack(bits)` | Step-by-step collision search | `bits: int` | Tuple `(msg1, msg2, hash, attempts, elapsed, attempts_hist, unique_hist)` or `None` | See detailed logic below |
| `user_input_mode(bits)` | Compare two user messages | `bits: int` | Console output | Uses `show_hash()` for both messages |
| `plot_attack_result(...)` | Matplotlib visualization | `bits`, `attempts_hist`, `unique_hist`, `collision_attempt` | Plot window | Line plot + vertical lines for theoretical bound & actual collision |
| `random_mode(bits)` | Wrapper for menu option 1 | `bits: int` | Console output + plot | Calls `random_attack()`, prints summary, calls `plot_attack_result()` |
| `choose_hash_size()` | Menu for bit selection | — | `int` (8, 12, 16, 20, 24) | Fixed mapping |
| `main()` | Top-level CLI loop | — | — | Menu-driven |

### `random_attack(bits)` Detailed Logic

1. **Print theoretical bound** using `birthday_bound(bits)` with formula `sqrt(2 × 2^bits × ln(2))`
2. **Initialize** `seen = {}`, `attempts_history = []`, `unique_hashes_history = []`, `start = time.perf_counter()`
3. **Loop** `attempt` from 1 to `MAX_ATTEMPTS (1,000,000)`:
   - Generate `message = random_message()`
   - Compute full SHA-256: `full_digest = hashlib.sha256(message.encode("utf-8")).hexdigest()`
   - Compute full integer: `full_value = int(full_digest, 16)`
   - Compute truncated: `truncated_value = full_value >> (256 - bits)`
   - **Collision check**: `if h in seen and seen[h] != message:` → collision found
     - Record elapsed time, append to histories
     - Print both messages, common hash, attempts, time, difference from theoretical bound
     - Return tuple with histories
   - **Store**: `seen[h] = message`
   - Append to histories
4. Return `None` if no collision within limit

### `user_input_mode(bits)` Detailed Logic

1. Prompt for two messages
2. If identical → print warning, return
3. Compute full SHA-256 and truncated hash for each
4. Compare truncated hashes
5. Print result with explicit note: "This uses a deliberately reduced hash space. It does NOT break full SHA-256."

### `plot_attack_result()` Logic

- X-axis: attempt number
- Y-axis: unique hashes observed (size of `seen`)
- Dashed vertical line: theoretical 50% birthday bound
- Dotted vertical line: actual collision attempt
- Title: "Birthday Attack Progress ({bits}-bit truncated SHA-256)"

---

## Theoretical Metrics Computed

| Metric | Formula (as coded) | Definition | Example (8 bits) |
|--------|-------------------|------------|------------------|
| **50% Birthday Bound** | `math.sqrt(2 * (2 ** bits) * math.log(2))` | Number of attempts for ≈50% probability of at least one collision | 18.84 attempts |
| **Expected Attempts (implied)** | Not explicitly computed separately; the bound above is used as the reference | The notebook uses the 50% bound as the primary theoretical metric | — |

**Note**: The notebook computes only the **50% birthday bound** (≈ `1.1774 × 2^(bits/2)`). The expected number of trials until first collision (`√(πN/2) ≈ 1.2533 × 2^(bits/2)`) is **not computed separately** in the notebook, though the report mentions both formulas.

---

## Feature Traceability Matrix

| Feature (from Section 4) | Implemented in Notebook | Described in Report Only | Proposed New for Web App |
|--------------------------|------------------------|-------------------------|--------------------------|
| **Module 1: Overview (concepts)** | ❌ | ✅ (Sections 1.1–1.3) | ✅ Interactive birthday paradox illustration |
| **Module 2: Interactive collision simulation** | ✅ (`random_attack`, `random_mode`) | ❌ | ✅ Live panels, SSE streaming, seed input, highlighted truncation, truncation banner |
| **Module 3: Message comparison** | ✅ (`user_input_mode`) | ❌ | ✅ Full vs truncated verdicts, adaptive explanation, UTF-8 note, empty/long/Unicode handling |
| **Module 4: Theory vs experiment** | ✅ (`birthday_bound`, `plot_attack_result`) | ✅ (Section 7.1: theory vs measurement for 16–32 bits) | ✅ Two metrics separately labeled, log-scale effort curve, multi-run histogram, "Why results vary" |
| **Module 5: Attack process walkthrough** | ❌ | ✅ (Sections 4.1–4.4: Yuval, Floyd, chosen-prefix, truncated) | ✅ Stepper animation, single-step mode, resistance comparison table |
| **Module 6: Real-world cases** | ❌ | ✅ (Section 5: MD5 rogue CA, Flame, SHAttered, Shambles, Sweet32) | ✅ Cards/timeline, explicit callouts distinguishing from lab |
| **Module 7: Security and learning** | ❌ | ✅ (Sections 8, 9: countermeasures, lessons) | ✅ Algorithm comparison table, knowledge checks, faculty Q&A |
| **Module 8: About and limitations** | ❌ | ✅ (Section 7 Limitations, throughout) | ✅ Traceability note, disclaimer, credits |

---

## Ambiguities, Bugs, Limitations & Proposed Handling

| # | Issue | Location | Proposed Handling |
|---|-------|----------|-------------------|
| 1 | **Only 50% bound computed; expected trials not separate** | `birthday_bound()` | Implement both metrics in backend: `bound_50pct = sqrt(2 * 2^n * ln(2))` and `expected_trials = sqrt(pi * 2^n / 2)`. Label clearly in UI. |
| 2 | **Truncation uses right-shift on full 256-bit integer** | `truncated_hash()` | Preserve exactly. This takes the **most significant bits** (MSBs). Document: "Truncation keeps the first `n` bits of the 256-bit digest." |
| 3 | **Collision check includes `seen[h] != message`** | `random_attack()` line 639 | Preserve. This correctly prevents false positives from duplicate random messages (extremely unlikely but correct). |
| 4 | **No seed/reproducibility support** | `random_message()` uses `random` module | Add optional `seed` parameter to simulation API. Use `random.Random(seed)` for isolated PRNG. |
| 5 | **Max bits hardcoded to 24 in menu; MAX_ATTEMPTS = 1M** | `choose_hash_size()`, `MAX_ATTEMPTS` | Backend: enforce max 32 bits (memory ~4GB for seen set). Frontend: slider 8–32, warn >24. |
| 6 | **Plot blocks execution (plt.show())** | `plot_attack_result()` | Backend returns chart data (JSON); frontend renders with Recharts/Plotly.js. |
| 7 | **No progress streaming; prints every attempt** | `random_attack()` | Backend: yield progress every N attempts or ~100ms via SSE. Frontend: throttled live updates. |
| 8 | **No cancellation/stop support** | CLI loop only | Backend: simulation ID with stop endpoint; SSE stream closure. |
| 9 | **Memory grows unbounded with `seen` dict** | `random_attack()` | Backend: cap at `min(2^bits, 10_000_000)` entries; warn user if bits > 24. |
| 10 | **Report describes 48-bit Floyd cycle & Yuval demo; not in notebook** | Report Sections 7.2, 7.3 | Mark as **[Proposed]** for web app. Can implement Floyd cycle as advanced mode later. |
| 11 | **Report mentions algorithm comparison table; not in notebook** | Report Section 8, 9 | Extract from report for Module 7. Mark as **[Report]**. |
| 12 | **Sweet32 is a block-cipher birthday attack, not hash collision** | Report Section 5.5 | In Module 6, add explicit callout: "Sweet32 attacks 64-bit block ciphers (3DES/Blowfish in CBC), not hash functions. Included because it demonstrates the same √N birthday bound principle." |
| 13 | **Report claims "48-bit collision in ~40M hashes" & "40-bit forge in 13s"** | Report Abstract, Section 7 | These are from a different script (`birthday_demo.py` per report). Not in this notebook. Mark as **[Report only]**. Do not replicate without separate verification. |
| 14 | **Hardcoded message length = 12 chars** | `random_message()` | Keep as default; allow override via API (not in notebook). |
| 15 | **No input validation for user messages (length, encoding)** | `user_input_mode()` | Backend: limit to 10KB, enforce UTF-8, return error for empty. |

---

## Reuse / Wrap / New Statement

| Category | Items |
|----------|-------|
| **Reused unchanged (core logic)** | `truncated_hash()` (MSB truncation via right-shift), `birthday_bound()` (50% bound formula), collision search loop structure (`seen` dict, distinct-message check), `user_input_mode()` comparison logic, hash display formatting. |
| **Wrapped / refactored for web** | `random_attack()` → async generator yielding progress events (attempt, latest message, full digest, truncated value, unique count, elapsed). `plot_attack_result()` → API returns chart data series. `random_message()` → deterministic with optional seed. `main()` menu → REST + SSE endpoints. |
| **New (not in notebook)** | FastAPI server with SSE streaming, simulation lifecycle (start/stop/reset), React frontend with 8 modules, KaTeX math rendering, Recharts visualizations, dark/light theme, accessibility (ARIA live regions), multi-run experiment mode, knowledge checks, faculty Q&A, real-world case cards, algorithm comparison table, resistance comparison visual, deployment configs (Docker, docker-compose). |

---

## Parity Verification Plan

To prove the refactored `birthday_lab` core matches the notebook:

1. **Extract notebook logic** into `backend/birthday_lab/core.py` as pure functions.
2. **Write parity tests** (`backend/tests/test_parity.py`) that:
   - Fix `random.seed(42)` and run `random_attack(8)` in both original notebook (via `nbconvert --execute` or extracted script) and refactored core.
   - Assert identical: collision hash, both messages, attempt count, truncated values.
   - Test `truncated_hash()` against known SHA-256 vectors for bits = 8, 12, 16, 24, 32.
   - Test `birthday_bound()` against hand-computed values.
3. If notebook cannot run headlessly, **document the extracted logic** and verify by running the notebook's printed example output (attempts 1–22 at 8 bits) against the refactored code.

---

*Generated as part of Phase 1 Analysis. Proceed to implementation upon confirmation.*