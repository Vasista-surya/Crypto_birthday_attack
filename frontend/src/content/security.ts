export const algorithmComparison = [
  {
    name: "MD5",
    digestSize: 128,
    status: "Broken",
    statusDetails: "Collisions in seconds on laptop; chosen-prefix practical (2008 rogue CA).",
    recommendation: "Must NOT be used for new applications requiring collision resistance.",
    yearBroken: 2004,
    notes: "RFC 6151 (2011): 'MD5 is no longer acceptable for use in digital signatures, certificates, or other collision-resistant applications.'"
  },
  {
    name: "SHA-1",
    digestSize: 160,
    status: "Broken",
    statusDetails: "Chosen-prefix collision (2020, ~USD 75k GPU rental); identical-prefix (2017, SHAttered).",
    recommendation: "Must NOT be used for new applications requiring collision resistance. NIST retirement by 2030.",
    yearBroken: 2017,
    notes: "NIST SP 800-131A: Disallowed for digital signatures after 2013. Major browsers removed trust for SHA-1 certs by 2017."
  },
  {
    name: "SHA-256",
    digestSize: 256,
    status: "Secure",
    statusDetails: "No known collisions; generic birthday bound 2^128.",
    recommendation: "Appropriate for security-sensitive use. SHA-256 and SHA-3 are appropriate for suitable security-sensitive use. Do NOT oversimplify to 'SHA-256 is unbreakable'.",
    yearBroken: null,
    notes: "Merkle-Damgård construction (length-extension possible). Use HMAC-SHA256 for message authentication."
  },
  {
    name: "SHA-3 (Keccak)",
    digestSize: 256,
    status: "Secure",
    statusDetails: "No known collisions; sponge construction avoids length-extension and Merkle-Damgård chaining issues.",
    recommendation: "Appropriate for security-sensitive use. Preferred for new designs due to different structure.",
    yearBroken: null,
    notes: "SHA-3 is not a replacement for SHA-2 — both are secure. SHA-3 offers different security properties (sponge)."
  }
];

export const countermeasures = [
  {
    title: "Use Stronger Hashes / Longer Digests",
    description: "Rule of thumb: For b bits of collision security, choose a digest of at least 2b bits. 128-bit security needs a 256-bit hash (SHA-256, SHA-3-256, SHA-512/256).",
    source: "Report Section 8, NIST FIPS 180-4"
  },
  {
    title: "Avoid Deliberate Truncation",
    description: "Never truncate hash outputs in production systems. Truncating SHA-256 to 128 bits reduces collision resistance from 2^128 to 2^64 — a factor of 2^64 easier.",
    source: "Notebook & Report Section 8"
  },
  {
    title: "Salting / Randomized Hashing",
    description: "NIST SP 800-106 'Randomized Hashing for Digital Signatures' — adding a random salt before hashing prevents precomputation and chosen-prefix attacks. Signed content must contain unpredictability; predictable serial numbers and timestamps made the rogue CA possible. Randomness removes the attacker's preparation window.",
    source: "Report Section 9, NIST SP 800-106"
  },
  {
    title: "Use HMAC for Message Authentication",
    description: "HMAC is not vulnerable to collision attacks in the same way because the secret key is unknown to the attacker. Even if H(m₁) = H(m₂), HMAC(k, m₁) ≠ HMAC(k, m₂) without knowing k. Use HMAC-SHA256 or HMAC-SHA3 instead of bare hash for authentication.",
    source: "Report Section 1.1 (HMAC mentioned as use case), cryptographic best practice"
  },
  {
    title: "Certificate & Signature Best Practices",
    description: "CAs stopped issuing SHA-1 certificates; browsers reject them; NIST phase-out by 2030; TLS stacks warn/limit 3DES after Sweet32. Crypto-agility and active inventory of algorithms are as important as the algorithm itself.",
    source: "Report Sections 5-6, NIST announcements"
  },
  {
    title: "Migrate Early",
    description: "Migrate when weaknesses are published, not when exploits appear. MD5 went from 'weak' to USD 657 rogue CA in 4 years. SHA-1 went from 2^80 to practical attack in 15 years. Attacks only get cheaper over time.",
    source: "Report Section 9, Lesson 2"
  }
];

export const lessonsLearned = [
  "Collision resistance costs 2^(n/2). Always halve the length when estimating security against attacks that exploit signing or uniqueness.",
  "Attacks only get cheaper. MD5 went from 'weak' to a USD 657 rogue CA in 4 years. SHA-1 went from 2^80 to an attack in 15 years. Migrate when weaknesses are published not when exploits appear.",
  "Signed content must contain unpredictability. Predictable serial numbers and timestamps made the rogue CA possible. Randomness removes the attacker's preparation window.",
  "A signature is only as strong as its hash. The strongest public-key scheme collapses to the collision resistance of the hash it signs.",
  "The same bound appears everywhere. Block-cipher block size (Sweet32), MAC tag length, and identifier size obey the square-root law.",
  "Legacy lingers. Deprecated algorithms stayed in certificates, VPNs, and tools for a decade or more. Crypto-agility and active inventory of algorithms are as important as the algorithm itself.",
  "Attackers innovate. Flame used a collision method that was not public. Defenders must assume attackers have better cryptanalysis than the literature."
];

// Re-export from separate files for convenience
export { knowledgeChecks } from './knowledgeChecks';
export { facultyQA } from './facultyQA';