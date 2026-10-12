export const facultyQA = [
  {
    id: 1,
    question: "What is the difference between the 50% birthday bound and the expected number of trials until first collision?",
    answer: `The 50% birthday bound (≈1.177×2^(n/2)) is the number of attempts where the probability of at least one collision reaches 50%.

The expected trials (≈1.253×2^(n/2)) is the mean of the distribution — the average number of attempts you'd see over many runs.

They differ because the distribution is skewed: you can get a collision very early (by chance), but the long tail of unlucky runs pulls the average higher. The lab shows both values separately — do not confuse them.`
  },
  {
    id: 2,
    question: "Why does the simulation sometimes find a collision before the 50% bound, and sometimes after?",
    answer: `The collision search is a random process. The 50% bound is a probability threshold, not a guarantee. In any single run:
- You might get lucky and collide early (e.g., at 0.5× bound)
- You might get unlucky and take 2× or 3× the bound
- Over many runs, the median approaches the 50% bound, and the mean approaches the expected-trials value

This is why the lab includes multi-run mode — to show the distribution, not just one run.`
  },
  {
    id: 3,
    question: "Does finding a collision in 16-bit truncated SHA-256 mean SHA-256 is broken?",
    answer: `Absolutely not. The collision is ONLY in the truncated 16-bit output. The full 256-bit SHA-256 digests of the two colliding messages are completely different.

This lab explicitly shows both full digests and highlights the truncated portion. The banner "Collision found in the truncated n-bit output only. Full SHA-256 digests are different." appears on every result.

Truncation demonstrates the birthday bound principle at a feasible scale — it does not weaken the underlying hash function.`
  },
  {
    id: 4,
    question: "What truncation method does this lab use, and why does it matter?",
    answer: `The lab uses MOST SIGNIFICANT BITS (MSB) truncation via right-shift: truncated = full_hash >> (256 - n).

This keeps the first n bits of the SHA-256 digest. Any consistent truncation method (MSB, LSB, middle bits) would have the same statistical properties for a good hash function, because SHA-256's output is indistinguishable from random.

The notebook and this lab preserve the exact right-shift method. Changing it would break parity with the reference implementation.`
  },
  {
    id: 5,
    question: "Why is there a hard limit of 32 bits in the web simulation?",
    answer: `Memory: storing seen hashes requires O(2^(n/2)) entries. At 32 bits, the expected collision needs ~65,000 entries (trivial). At 48 bits: ~4 billion entries (~32 GB RAM). At 64 bits: 2^32 entries (infeasible).

The 32-bit cap ensures the simulation completes in reasonable time/memory on the server. The UI warns above 24 bits where memory grows noticeably.

A full SHA-256 collision (128-bit bound) is physically impossible to request — this is a deliberate safety constraint.`
  },
  {
    id: 6,
    question: "How does the random message generation affect reproducibility?",
    answer: `The notebook uses Python's random module without a fixed seed, so each run produces different results. The web app adds an optional seed parameter for reproducible demonstrations.

With the same seed and bit size, the collision search will produce identical messages, attempts, and timing (modulo system performance). This is useful for teaching and debugging.`
  },
  {
    id: 7,
    question: "What is the difference between preimage resistance, second-preimage resistance, and collision resistance?",
    answer: `| Property | Attacker Goal | Generic Cost |
|----------|---------------|--------------|
| Preimage | Given y, find m: H(m)=y | 2^n |
| Second-preimage | Given m₁, find m₂≠m₁: H(m₂)=H(m₁) | 2^n |
| Collision | Find any m₁≠m₂: H(m₁)=H(m₂) | 2^(n/2) |

Collision resistance is the weakest. This is why hash output size is determined by collision resistance requirements, not preimage resistance.`
  },
  {
    id: 8,
    question: "How does the Yuval birthday attack on signatures work?",
    answer: `1. Attacker creates many variants of a legitimate document (M) and a fraudulent document (M') using invisible changes (extra spaces, Unicode, comments).
2. Hashes all variants until finding H(M*) = H(M'*) for some pair.
3. Gets victim to sign the legitimate version M*.
4. Transfers the signature to the fraudulent version M'* — it verifies because the hash is identical.

Cost: ~2×2^(n/2) hashes, 2^(n/2) memory. The lab's Module 5 demonstrates this step-by-step.`
  },
  {
    id: 9,
    question: "What is the Floyd/Pollard-rho cycle-finding method for memory-less collision search?",
    answer: `Instead of storing all seen hashes (O(2^(n/2)) memory), treat the hash as an iterated function: x_{i+1} = f(x_i). This sequence must eventually cycle.

Floyd's algorithm uses two pointers: tortoise (x_i) and hare (x_{2i}). When they meet, a cycle is detected. A second phase finds the collision inputs.

Cost: O(2^(n/2)) time, O(1) memory. Van Oorschot-Wiener added distinguished points for parallelization. The report mentions this but the notebook doesn't implement it.`
  },
  {
    id: 10,
    question: "Why did the MD5 rogue CA attack (2008) require predicting the CA's serial number?",
    answer: `The attack was a chosen-prefix collision: the legitimate prefix (certificate request) and rogue prefix (fake CA cert) differ in the subject field. To make the collision work, the attacker needed to know the EXACT bytes the CA would insert (serial number, validity period).

The researchers analyzed thousands of issued certificates to find the serial counter was sequential and issuance rate stable. They purchased certificates over a weekend to hit the predicted serial number. Modern CAs use random serial numbers to prevent this.`
  },
  {
    id: 11,
    question: "How does Sweet32 differ from the hash collisions demonstrated in this lab?",
    answer: `Sweet32 is NOT a hash collision. It's a birthday-bound attack on 64-bit BLOCK CIPHERS (3DES, Blowfish) in CBC mode.

When 2^32 blocks are encrypted under the same key, two ciphertext blocks likely collide. XORing them reveals XOR of the corresponding plaintext blocks, allowing cookie/token recovery.

The birthday principle (√N) is identical, but the target is a cipher's block size, not a hash output. The lab includes Sweet32 in Module 6 with an explicit callout distinguishing it.`
  },
  {
    id: 12,
    question: "What are the limitations of this lab's simulation?",
    answer: `1. **Truncated digests only** — demonstrates generic birthday bound, not cryptanalytic attacks on MD5/SHA-1.

2. **Random search, not differential cryptanalysis** — real attacks on MD5/SHA-1 use structured differential paths, not random sampling.

3. **PRNG-dependent** — results vary with random seed and system RNG. Not a formal proof.

4. **Memory-bounded** — max 32 bits in web version; notebook max 24 bits.

5. **No chosen-prefix or multi-block attacks** — those require sophisticated cryptanalysis beyond generic birthday search.

6. **Hardware-dependent timing** — attempts/second varies by CPU.

The lab is an educational demonstration of the PRINCIPLE, not a replication of real attacks.`
  },
  {
    id: 13,
    question: "Why does the lab show both 'theoretical 50% bound' and 'expected trials'? Aren't they the same?",
    answer: `They are DIFFERENT metrics, often confused:

• 50% bound = √(2N ln 2) ≈ 1.177√N — where P(collision) ≈ 0.5
• Expected trials = √(πN/2) ≈ 1.253√N — mean of the distribution

The notebook only computes the 50% bound. The report mentions both. The web app shows them separately with distinct labels and formulas.

In the simulation comparison, the actual attempts are compared to BOTH values to show the relationship.`
  },
  {
    id: 14,
    question: "How does HMAC resist collision attacks when the underlying hash doesn't?",
    answer: `HMAC(k, m) = H((k ⊕ opad) || H((k ⊕ ipad) || m))

The secret key k is mixed into the hash input. Even if H(m₁) = H(m₂) for a collision, the attacker doesn't know k, so they cannot compute HMAC(k, m₁) or HMAC(k, m₂) offline.

Collision attacks require the attacker to evaluate the hash function themselves. With HMAC, the key is unknown, so the attacker cannot search for collisions in the HMAC output without knowing the key.`
  },
  {
    id: 15,
    question: "What should students remember about algorithm migration from the case studies?",
    answer: `Key lessons:
- MD5: broken 2004 → rogue CA 2008 (4 years, $657)
- SHA-1: theoretical 2^80 → SHAttered 2017 → Shambles 2020 ($75k)
- Attacks NEVER get harder — they get cheaper, faster, more accessible
- Migrate when weaknesses are PUBLISHED, not when EXPLOITS appear
- Legacy algorithms persist for a decade+ (3DES, SHA-1 in certs, Git)
- Crypto-agility (ability to swap algorithms) is as important as the algorithm choice`
  }
];

export type FacultyQAItem = typeof facultyQA[0];