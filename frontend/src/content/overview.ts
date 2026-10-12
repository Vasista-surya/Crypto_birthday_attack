export const overviewContent = {
  title: "Birthday Attacks and Cryptographic Hashes",
  subtitle: "Why 2^(n/2), not 2^n, decides how long a hash must be",
  
  introduction: `A cryptographic hash function takes any message and turns it into a short fixed-length piece of data called a digest. This digest acts like a fingerprint for the message. Many systems depend on the idea that no two different messages will ever produce the same digest. Digital signatures, certificates, code signing, and version control all rely on this promise.`,

  sections: [
    {
      id: "hash-functions",
      title: "What is a Hash Function?",
      content: `A hash function H takes a message of any length and produces a fixed-size output of n bits. A secure hash function needs three security properties:

• **Preimage resistance** — Given a hash value y, it should be very hard to find any message m such that H(m) = y. Generic cost: 2^n operations.

• **Second-preimage resistance** — Given a message m₁, it should be very hard to find a different message m₂ such that H(m₂) = H(m₁). Generic cost: 2^n operations.

• **Collision resistance** — It should be very hard to find ANY two different messages m₁ ≠ m₂ such that H(m₁) = H(m₂). Generic cost: ~2^(n/2) operations due to the birthday bound.

Collision resistance is the property that determines the required output size. Hashes are used in digital signatures (signing the hash instead of the full message), X.509 certificates, code signing, HMAC, commitment schemes, blockchains, and content-addressable storage like Git.`
    },
    {
      id: "birthday-paradox",
      title: "The Birthday Paradox",
      content: `It seems surprising that in a room of just 23 people, the probability that two share a birthday exceeds 50%, even though there are 365 possible days. The same principle applies to hash digests.

Suppose a hash has N = 2^n possible outputs. We compute k hashes of different inputs. The probability of at least one collision is:

P(collision) = 1 - ∏(1 - i/N) ≈ 1 - e^(-k(k-1)/2N)

Setting P = 1/2 gives k ≈ 1.1774 × √N = 1.1774 × 2^(n/2).
The expected number of trials until the first collision is √(πN/2) ≈ 1.2533 × 2^(n/2).

The number of pairs among k items grows as k²/2, which is why the effort scales with the square root of the output space rather than with the space itself.`
    },
    {
      id: "complexity",
      title: "Collision vs Preimage Complexity",
      content: `This is the critical insight:

| Attack Type | Generic Cost | For 256-bit Hash |
|-------------|--------------|------------------|
| Preimage / Second-preimage | 2^n | 2^256 (infeasible) |
| Collision (birthday) | 2^(n/2) | 2^128 (still infeasible) |
| Collision (truncated to 32 bits) | 2^16 | ~65,536 (trivial) |

**The effective collision security is about half the digest length.** This is why SHA-256 provides ~128-bit collision resistance, not 256-bit. And why truncating a hash dramatically reduces its collision resistance.`
    },
    {
      id: "key-takeaways",
      title: "Key Takeaways",
      items: [
        "Hash functions produce fixed-size digests from arbitrary-length messages",
        "Collision resistance is the weakest property — generic attack costs 2^(n/2), not 2^n",
        "The birthday paradox explains why: number of pairs grows quadratically",
        "For b bits of collision security, you need a 2b-bit hash (e.g., 256-bit hash for 128-bit security)",
        "Truncating a hash output makes collisions exponentially easier to find",
        "This lab demonstrates collisions ONLY in deliberately truncated SHA-256 — full SHA-256 is not broken"
      ]
    }
  ]
};