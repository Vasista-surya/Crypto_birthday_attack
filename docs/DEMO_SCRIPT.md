# Faculty Demo Script: Birthday Attack Lab

**Duration**: 8–10 minutes  
**Audience**: Faculty reviewers  
**Goal**: Demonstrate all 8 modules, highlight educational value, show notebook parity

---

## Pre-Demo Setup (2 minutes before)

```bash
# Start services
docker-compose up -d

# Verify
curl http://localhost/api/health
# Should return: {"status":"ok","service":"Birthday Attack Lab API"}
```

Open browser to `http://localhost` — verify dark mode, navigation bar visible.

---

## Demo Flow (8–10 minutes)

### 0. Landing / Navigation (30 seconds)
**Module**: Overview (Learn)

**Script**:
> "This is the Birthday Attack Lab — an interactive cryptography laboratory built from our academic case study. The navigation shows our learning path: Learn → Experiment → Analyse → Apply → Review. Dark mode by default, with a light theme toggle. The footer always reminds users: collisions are in truncated SHA-256 only."

**Actions**:
- Click theme toggle (☀️/🌙)
- Show progress bar under nav
- Click through nav items briefly

---

### 1. Learn — Concepts & Birthday Paradox (90 seconds)
**Module**: Overview

**Script**:
> "Module 1 covers fundamentals: hash functions, three security properties, and why collision resistance is the weakest. The key insight: collision cost is 2^(n/2), not 2^n, due to the birthday paradox."

**Actions**:
- Scroll to **Interactive Birthday Paradox**
- Set Days = 365, People = 23 → Show 50.7%
- Explain: "23 people, 253 pairs — quadratic growth in pairs is why probability scales with √N"
- Show KaTeX formula with "In words" expandable
- Point out worked example box

---

### 2. Experiment — Live Collision Search (2 minutes)
**Module**: Simulation

**Script**:
> "Module 2 is the core experiment. We search for collisions in truncated SHA-256 using Server-Sent Events for real-time updates. Let's run 16 bits — the notebook's recommended demo size."

**Actions**:
- Select **16 bits** (default)
- Enter seed **42** (for reproducibility)
- Click **Start Search**
- Watch live panels: attempts, latest message, full digest with highlighted truncation, rate
- Wait for collision (typically 200-400 attempts at 16 bits)
- **Key moment**: Show collision result — both messages, both full digests (different!), common truncated hash
- **Critical**: Point out banner: *"Collision found in the truncated 16-bit output only. Full SHA-256 digests are different."*
- Show progress chart with 50% bound line and actual collision line
- Click **Reset**, mention seed reproducibility

---

### 3. Analyse — Message Comparison (60 seconds)
**Module**: Compare

**Script**:
> "Module 3 lets students compare any two messages. This shows the difference between full SHA-256 collision (impossible) and truncated collision (easy)."

**Actions**:
- Message 1: `hello world`
- Message 2: `hello world!`
- Bits: 16 → Click Compare
- Show: Full digests different, truncated different → "No Collision"
- Message 2: `hello world` (same) → Compare
- Show: Identical messages warning → "Not a collision"
- Explain adaptive explanation panel

---

### 4. Theory — Metrics & Charts (90 seconds)
**Module**: Theory

**Script**:
> "Module 4 separates two theoretical metrics often confused: the 50% birthday bound and the expected trials. The notebook only computed the 50% bound; we added expected trials from the report."

**Actions**:
- Select 16 bits → Show both metrics cards with formulas
- If previous simulation ran: Show comparison card with differences
- Scroll to **Log-scale chart**: Preimage (2ⁿ, red dashed) vs Collision (2ⁿᐟ², amber dashed) vs 50% bound (teal) vs Expected trials (violet)
- Show accessible data table (expand "View data table")
- Run **Batch Experiment**: 16 bits, 20 trials → Show histogram with mean/median/min/max and theoretical markers
- Explain: "Mean → expected trials, Median → 50% bound. Spread shows randomness."

---

### 5. Walkthrough — Attack Process (60 seconds)
**Module**: Walkthrough

**Script**:
> "Module 5 animates the 6-step attack process and compares the three resistance properties."

**Actions**:
- Click through Steps 1–6 with Next/Previous
- Step 5: Emphasize "Full SHA-256 digests are STILL DIFFERENT"
- Show **Resistance Comparison Table**: Preimage (2ⁿ), Second-preimage (2ⁿ), Collision (2ⁿᐟ²)
- Show visual summary cards

---

### 6. Apply — Real-World Cases (90 seconds)
**Module**: RealWorld

**Script**:
> "Module 6 covers 5 historical incidents. Critical: each has a callout explaining how it differs from our lab's simplified demonstrations."

**Actions**:
- Filter by category (Hash Collision, Chosen-Prefix, Block Cipher)
- Click **MD5 Rogue CA (2008)** → Expand → Show details, source, lab difference
- Click **Sweet32 (2016)** → Expand → **Key**: "NOT a hash collision — birthday bound on 64-bit block ciphers"
- Mention: Flame (2012) used unpublished variant; SHAttered (2017) 100,000× faster than generic; Shambles (2020) $75k GPU rental

---

### 7. Review — Security & Learning (60 seconds)
**Module**: Security

**Script**:
> "Module 7 has the algorithm comparison, countermeasures, and interactive assessments."

**Actions**:
- Show **Algorithm Comparison Table**: MD5/SHA-1 (Broken) vs SHA-256/SHA-3 (Secure)
- Highlight: "Do not oversimplify to 'SHA-256 is unbreakable'"
- Scroll **Countermeasures** (6 cards) and **Lessons Learned** (7 items)
- **Knowledge Check**: Answer 2-3 questions (show immediate feedback)
- **Faculty Q&A**: Navigate 15 questions with model answers (collapsible)

---

### 8. About — Limitations & Traceability (30 seconds)
**Module**: About

**Script**:
> "Module 8 documents what this lab does and doesn't do, with a full traceability matrix."

**Actions**:
- Show "What This Lab Does NOT Demonstrate" callout
- Show **Traceability Matrix** table (8 modules × 3 sources)
- Show credits and repository link

---

## Closing (30 seconds)

**Script**:
> "This lab preserves the notebook's exact logic — 44 parity tests pass — while adding professional UI, accessibility, and educational features. Every result view maintains cryptographic honesty. The code is on GitHub at `Vasista-surya/Crypto_birthday_attack`, branch `vasista`. Ready for questions."

**Actions**:
- Show GitHub repo in browser
- Mention DEPLOYMENT.md for production setup

---

## Backup Plans

| Issue | Fallback |
|-------|----------|
| SSE fails | Use "Reset" and re-run; or show screenshots in repo |
| Collision takes too long | Use 8 bits (instant) or pre-run with seed 42 |
| Chart not rendering | Expand data table (always works) |
| Theme broken | Hard refresh (Ctrl+Shift+R) |

---

## Key Talking Points for Q&A

| Question | Answer |
|----------|--------|
| "Does this break SHA-256?" | No — only truncated. Full digests differ. Banner on every result. |
| "Why 32-bit max?" | Memory: 2¹⁶ entries at 32 bits. 48 bits = 4B entries (~32 GB). |
| "Notebook parity?" | 44 tests pass. Truncation, formulas, RNG, collision logic all verified. |
| "Real attacks vs lab?" | Lab = generic birthday bound (random). Real = differential paths, chosen-prefix. |
| "Sweet32 in hash lab?" | Included to show √N principle applies beyond hashes. Explicit callout. |
| "Deployability?" | Docker Compose, or separate Vercel/Netlify + Render/Railway. DEPLOYMENT.md has details. |