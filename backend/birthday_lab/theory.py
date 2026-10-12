"""
Theoretical formulas from the report (Section 1.3).

These are the single source of truth for all mathematical formulas.
Frontend displays them but never re-derives them.
"""

import math


def collision_probability(k: int, bits: int) -> float:
    """
    Probability of at least one collision after k distinct hashes.

    Exact: P = 1 - ∏_{i=1}^{k-1} (1 - i/N)
    Approximation (report): P ≈ 1 - exp(-k(k-1) / 2N)
    Where N = 2^bits
    """
    if bits < 1 or k < 0:
        raise ValueError("bits >= 1, k >= 0 required")
    if k <= 1:
        return 0.0
    n = 2 ** bits
    # Use approximation for large n (matches report)
    return 1.0 - math.exp(-k * (k - 1) / (2 * n))


def birthday_bound_50pct(bits: int) -> float:
    """
    50% collision probability threshold (k where P ≈ 0.5).

    Formula: k ≈ sqrt(2 * N * ln(2)) = sqrt(2 * 2^bits * ln(2))
    ≈ 1.1774 * 2^(bits/2)
    """
    if bits < 1:
        raise ValueError("bits >= 1 required")
    return math.sqrt(2 * (2 ** bits) * math.log(2))


def expected_trials(bits: int) -> float:
    """
    Expected number of trials until first collision.

    Formula: E ≈ sqrt(π * N / 2) = sqrt(π * 2^bits / 2)
    ≈ 1.2533 * 2^(bits/2)
    From report Section 1.3.
    """
    if bits < 1:
        raise ValueError("bits >= 1 required")
    return math.sqrt(math.pi * (2 ** bits) / 2)


def bits_for_security_level(collision_security_bits: int) -> int:
    """
    Rule of thumb from report Section 8:
    For b bits of collision security, need digest of at least 2b bits.
    """
    return collision_security_bits * 2


def preimage_cost(bits: int) -> float:
    """Generic preimage/second-preimage cost: 2^bits."""
    return float(2 ** bits)


def collision_cost_generic(bits: int) -> float:
    """Generic collision cost (birthday bound): 2^(bits/2)."""
    return float(2 ** (bits / 2))


def theory_series(min_bits: int = 8, max_bits: int = 32, step: int = 1) -> dict:
    """
    Generate theory curve data for charting.

    Returns dict with keys: bits, bound_50pct, expected_trials, preimage_cost, collision_cost
    """
    bits_list = list(range(min_bits, max_bits + 1, step))
    return {
        "bits": bits_list,
        "bound_50pct": [birthday_bound_50pct(b) for b in bits_list],
        "expected_trials": [expected_trials(b) for b in bits_list],
        "preimage_cost": [preimage_cost(b) for b in bits_list],
        "collision_cost_generic": [collision_cost_generic(b) for b in bits_list],
    }


# LaTeX formulas for frontend rendering (KaTeX)
FORMULAS = {
    "collision_probability_exact": r"P = 1 - \prod_{i=1}^{k-1} \left(1 - \frac{i}{N}\right)",
    "collision_probability_approx": r"P \approx 1 - e^{-k(k-1)/2N}",
    "bound_50pct": r"k_{50\%} \approx \sqrt{2 N \ln 2} = \sqrt{2 \cdot 2^n \ln 2} \approx 1.1774 \cdot 2^{n/2}",
    "expected_trials": r"E[k] \approx \sqrt{\frac{\pi N}{2}} = \sqrt{\frac{\pi \cdot 2^n}{2}} \approx 1.2533 \cdot 2^{n/2}",
    "preimage_cost": r"2^n",
    "collision_cost_generic": r"2^{n/2}",
    "security_rule": r"\text{digest bits} \ge 2 \times \text{collision security bits}",
}


def get_formula_latex(key: str) -> str:
    """Get LaTeX formula by key."""
    return FORMULAS.get(key, "")


def get_formula_reading(key: str) -> str:
    """Plain-language reading of formula."""
    readings = {
        "collision_probability_exact": (
            "The probability of at least one collision equals 1 minus the product of "
            "(1 - i/N) for i from 1 to k-1, where N = 2^n is the hash space size."
        ),
        "collision_probability_approx": (
            "Approximately 1 minus e to the power of minus k times (k-1) over 2N. "
            "In words: the chance of a collision grows roughly as the square of the number of attempts."
        ),
        "bound_50pct": (
            "The 50% threshold is the square root of 2 times the hash space size times ln(2). "
            "For an n-bit hash, this is about 1.1774 times 2 to the n/2."
        ),
        "expected_trials": (
            "The expected number of trials until the first collision is the square root of "
            "pi times the hash space size over 2. For an n-bit hash, about 1.2533 times 2 to the n/2."
        ),
        "preimage_cost": "Brute-force preimage or second-preimage search requires 2^n hash evaluations.",
        "collision_cost_generic": "Generic collision search requires 2^(n/2) evaluations — the square root of the hash space.",
        "security_rule": "To get b bits of collision resistance, use a hash with at least 2b bits of output.",
    }
    return readings.get(key, "")