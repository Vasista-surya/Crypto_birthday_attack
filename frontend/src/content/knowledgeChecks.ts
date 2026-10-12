export const knowledgeChecks = [
  {
    id: 1,
    question: "What is the generic cost of finding a collision in an n-bit hash function?",
    type: "multiple-choice",
    options: [
      { id: "a", text: "2^n" },
      { id: "b", text: "2^(n/2)", correct: true },
      { id: "c", text: "n^2" },
      { id: "d", text: "2^n / 2" }
    ],
    explanation: "The birthday paradox shows that with √N samples you have ~50% chance of collision, where N = 2^n. So cost is 2^(n/2), not 2^n."
  },
  {
    id: 2,
    question: "In a room of 23 people, the probability of a shared birthday exceeds 50%. This is because...",
    type: "multiple-choice",
    options: [
      { id: "a", text: "23 is close to 365/2" },
      { id: "b", text: "The number of pairs grows quadratically (23×22/2 = 253 pairs)", correct: true },
      { id: "c", text: "Birthdays are not uniformly distributed" },
      { id: "d", text: "People tend to be born in certain months" }
    ],
    explanation: "With 23 people there are 253 pairs. Each pair has a 1/365 chance of matching. The quadratic growth in pairs is why the probability scales with √N, not N."
  },
  {
    id: 3,
    question: "If SHA-256 is truncated to 64 bits, what is the approximate collision resistance?",
    type: "multiple-choice",
    options: [
      { id: "a", text: "2^64 (same as full SHA-256)" },
      { id: "b", text: "2^32", correct: true },
      { id: "c", text: "2^128" },
      { id: "d", text: "2^192" }
    ],
    explanation: "Truncating to 64 bits means the effective hash space is 2^64. Birthday bound = 2^(64/2) = 2^32. The truncation destroys the collision resistance of the full hash."
  },
  {
    id: 4,
    question: "True or False: Finding a collision in a truncated hash means the full hash function is broken.",
    type: "true-false",
    correct: false,
    explanation: "FALSE. A collision in truncated SHA-256 only means the reduced hash space has a collision. The full 256-bit digests are completely different. This lab demonstrates this explicitly."
  },
  {
    id: 5,
    question: "What is the difference between a preimage attack and a collision attack?",
    type: "multiple-choice",
    options: [
      { id: "a", text: "Preimage: find m for given H(m); Collision: find any m₁≠m₂ with H(m₁)=H(m₂)", correct: true },
      { id: "b", text: "Preimage is easier than collision" },
      { id: "c", text: "They are the same thing" },
      { id: "d", text: "Preimage requires knowing the original message" }
    ],
    explanation: "Preimage resistance: given y, find m such that H(m)=y (cost 2^n). Collision resistance: find any m₁≠m₂ with H(m₁)=H(m₂) (cost 2^(n/2)). Collision is the weaker property."
  },
  {
    id: 6,
    question: "The Sweet32 attack targets...",
    type: "multiple-choice",
    options: [
      { id: "a", text: "SHA-256 truncated to 32 bits" },
      { id: "b", text: "64-bit block ciphers (3DES, Blowfish) in CBC mode", correct: true },
      { id: "c", text: "MD5 hash function" },
      { id: "d", text: "RSA-1024 signatures" }
    ],
    explanation: "Sweet32 is a birthday-bound attack on 64-bit BLOCK CIPHERS, not hash functions. After 2^32 blocks encrypted under the same key, ciphertext collisions reveal plaintext information."
  },
  {
    id: 7,
    question: "Which real-world attack created a rogue Certificate Authority trusted by all browsers?",
    type: "multiple-choice",
    options: [
      { id: "a", text: "Flame malware (2012)" },
      { id: "b", text: "MD5 Rogue CA Certificate (2008)", correct: true },
      { id: "c", text: "SHAttered (2017)" },
      { id: "d", text: "SHA-1 Shambles (2020)" }
    ],
    explanation: "The 2008 MD5 rogue CA attack used a chosen-prefix collision on MD5 to create a fake intermediate CA certificate. Cost: ~USD 657, ~200 PlayStation 3s, 18 hours."
  },
  {
    id: 8,
    question: "True or False: SHA-1 chosen-prefix collision (Shambles, 2020) cost approximately $75,000 in GPU rental.",
    type: "true-false",
    correct: true,
    explanation: "TRUE. Leurent & Peyrin's SHA-1 chosen-prefix collision used 900 GTX 1060 GPUs for 2 months. Rental cost ~$45k, actual spend ~$75k. This made SHA-1 collisions practical for motivated attackers."
  },
  {
    id: 9,
    question: "What is the rule of thumb for choosing a hash size for b bits of collision security?",
    type: "multiple-choice",
    options: [
      { id: "a", text: "Use b-bit hash" },
      { id: "b", text: "Use 2b-bit hash", correct: true },
      { id: "c", text: "Use b²-bit hash" },
      { id: "d", text: "Use 2^b-bit hash" }
    ],
    explanation: "Since collision resistance is 2^(n/2), to get b bits of collision security you need n = 2b bits of output. For 128-bit collision security, use 256-bit hash (SHA-256, SHA-3-256)."
  },
  {
    id: 10,
    question: "In this lab's simulation, what does the '50% birthday bound' represent?",
    type: "multiple-choice",
    options: [
      { id: "a", text: "The exact number of attempts needed to guarantee a collision" },
      { id: "b", text: "The number of attempts for ~50% probability of at least one collision", correct: true },
      { id: "c", text: "The expected number of trials until first collision" },
      { id: "d", text: "The maximum attempts before giving up" }
    ],
    explanation: "The 50% bound (≈1.177×2^(n/2)) is where collision probability reaches 50%. The expected trials (≈1.253×2^(n/2)) is the average. Results vary randomly around these values."
  },
  {
    id: 11,
    question: "Why does this lab use truncated SHA-256 instead of full SHA-256?",
    type: "multiple-choice",
    options: [
      { id: "a", text: "SHA-256 is broken" },
      { id: "b", text: "Full SHA-256 collisions would take 2^128 operations — infeasible", correct: true },
      { id: "c", text: "Truncated is more secure" },
      { id: "d", text: "SHA-256 is not available in Python" }
    ],
    explanation: "Full SHA-256 collision resistance is 2^128 — completely infeasible. Truncating lets us demonstrate the birthday bound in milliseconds. The statistical behavior is identical, just at a smaller scale."
  },
  {
    id: 12,
    question: "What is the key difference between identical-prefix and chosen-prefix collisions?",
    type: "multiple-choice",
    options: [
      { id: "a", text: "Identical-prefix requires the same prefix; chosen-prefix allows different prefixes", correct: true },
      { id: "b", text: "Chosen-prefix is always faster" },
      { id: "c", text: "They are the same attack" },
      { id: "d", text: "Identical-prefix only works on MD5" }
    ],
    explanation: "Identical-prefix: H(P||B₁) = H(P||B₂) — same prefix P, different blocks. Chosen-prefix: H(P₁||S₁) = H(P₂||S₂) — completely different prefixes chosen by attacker. Chosen-prefix is far more powerful (e.g., for X.509 certs with different subjects)."
  }
];

export type KnowledgeCheckQuestion = typeof knowledgeChecks[0];