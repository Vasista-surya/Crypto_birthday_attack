export const realWorldCases = [
  {
    id: "md5-rogue-ca",
    year: 2008,
    name: "MD5 Rogue CA Certificate",
    category: "Hash Collision (Chosen-Prefix)",
    weakness: "Commercial CA still signing certificates with MD5; predictable serial numbers and issuance timing.",
    impact: "Researchers created a rogue intermediate CA certificate trusted by all major browsers. Could sign certificates for any website, enabling undetectable HTTPS interception.",
    lesson: "CAs must stop using broken hash functions; include randomness in serial numbers to prevent prediction.",
    details: "7 researchers, ~200 PlayStation 3 consoles, birthday stage completed in 18 hours. Purchased certificates over a weekend until expected serial number was reached. Total certificate cost: USD 657. Fake CA cert deliberately created with past expiry date to prevent misuse.",
    source: "Stevens et al., 'Short Chosen-Prefix Collisions for MD5 and the Creation of a Rogue CA Certificate,' CRYPTO 2009.",
    labDifference: "This attack used a sophisticated chosen-prefix collision on full MD5 (128-bit), exploiting MD5's broken compression function. Our lab demonstrates the generic birthday bound on truncated SHA-256 — a much simpler random search with no cryptanalysis."
  },
  {
    id: "flame-malware",
    year: 2012,
    name: "Flame Malware",
    category: "Hash Collision (Chosen-Prefix Variant)",
    weakness: "Microsoft Terminal Server Licensing CA still used MD5 for signing certificates.",
    impact: "Flame spyware spread using a certificate appearing to be signed by Microsoft as a Windows Update, enabling nation-state surveillance.",
    lesson: "Powerful attackers can improve on published cryptanalysis. Migration must happen when weaknesses are published, not when exploits appear.",
    details: "Marc Stevens (CWI) showed the certificate was created using a variant of the chosen-prefix collision on MD5. Attack occurred in 2010, eight months after the public chosen-prefix method was published (2009). Demonstrates attackers may have better cryptanalysis than the public literature.",
    source: "CWI news, Flame analysis by Marc Stevens (2012).",
    labDifference: "Flame used a chosen-prefix collision on full MD5 with a sophisticated differential path. Our lab uses random collision search on truncated SHA-256 — no chosen prefixes, no differential cryptanalysis."
  },
  {
    id: "shattered",
    year: 2017,
    name: "SHAttered (First SHA-1 Collision)",
    category: "Hash Collision (Identical-Prefix)",
    weakness: "SHA-1 compression function vulnerabilities allowing identical-prefix collision far below generic 2^80 bound.",
    impact: "Two PDF files with identical SHA-1 hash. First practical full SHA-1 collision. Proved SHA-1 was broken for collision resistance.",
    lesson: "The generic birthday bound (2^(n/2)) is a baseline; cryptanalysis can do dramatically better. SHA-1's 160-bit output gave only ~63-bit collision resistance in practice.",
    details: "CWI Amsterdam + Google. ~2^63.1 SHA-1 compressions (6,500 CPU-years + 100 GPU-years). Over 100,000× faster than generic birthday attack (2^80). Identical-prefix collision — both PDFs share a common prefix.",
    source: "Stevens et al., 'The First Collision for Full SHA-1,' CRYPTO 2017. https://shattered.io",
    labDifference: "SHAttered exploited SHA-1's internal structure with a complex differential path. Our lab's truncated SHA-256 collisions use the generic birthday bound with no structural attack on SHA-256."
  },
  {
    id: "sha1-shambles",
    year: 2020,
    name: "SHA-1 Shambles (Chosen-Prefix Collision)",
    category: "Hash Collision (Chosen-Prefix)",
    weakness: "Chosen-prefix collision on SHA-1, more powerful than identical-prefix.",
    impact: "Two PGP keys with different identities but same SHA-1 hash. Certification signature on one key transfers to the other. GnuPG dropped SHA-1 identity signatures (CVE-2019-14855).",
    lesson: "Chosen-prefix collisions are far more dangerous for real formats (X.509, PGP) than identical-prefix. Cost dropped to ~USD 75k — within reach of motivated attackers.",
    details: "Leurent & Peyrin. Complexity reduced from 2^67.1 to 2^63.4. Used 900 Nvidia GTX 1060 GPUs for 2 months = 107 GPU-years. Rental cost ~USD 45,000; actual spend ~USD 75,000.",
    source: "Leurent & Peyrin, 'SHA-1 is a Shambles,' USENIX Security 2020. https://sha-mbles.github.io",
    labDifference: "SHA-1 Shambles is a chosen-prefix collision on full SHA-1 using advanced cryptanalysis. Our lab demonstrates random collisions on truncated output — the simplest possible birthday attack."
  },
  {
    id: "sweet32",
    year: 2016,
    name: "Sweet32 (Birthday Bound on Block Ciphers)",
    category: "Block Cipher Birthday Attack (NOT a hash collision)",
    weakness: "Birthday bound applies to 64-bit block ciphers (3DES, Blowfish) in CBC mode. After 2^32 blocks encrypted under the same key, ciphertext blocks likely collide.",
    impact: "XOR of colliding ciphertexts reveals XOR of plaintext blocks. Recovered HTTP session cookie from HTTPS after ~610 GB / 30.5 hours. Recovered 16-byte OpenVPN auth token after ~785 GB / 18.6 hours.",
    lesson: "The same √N birthday bound applies to block-cipher block size, MAC tag length, short identifiers, and session tokens. Any 64-bit value needing uniqueness is only safe for ~2^32 uses.",
    details: "Bhargavan & Leurent. CVE-2016-2183 (TLS), CVE-2016-6329 (OpenVPN). This is a birthday attack on the BLOCK SIZE of a cipher, not on a hash function.",
    source: "Bhargavan & Leurent, 'On the Practical (In-)Security of 64-bit Block Ciphers,' ACM CCS 2016. https://www.sweet32.info/",
    labDifference: "IMPORTANT: Sweet32 is NOT a hash collision. It exploits the 64-bit block size of 3DES/Blowfish in CBC mode. The birthday bound principle is identical (√N), but the target is a block cipher, not a hash function. Our lab only demonstrates hash truncation collisions."
  }
];

export const caseCategories = [
  { id: "all", label: "All Cases" },
  { id: "hash-collision", label: "Hash Collisions" },
  { id: "chosen-prefix", label: "Chosen-Prefix" },
  { id: "block-cipher", label: "Block Cipher" }
];