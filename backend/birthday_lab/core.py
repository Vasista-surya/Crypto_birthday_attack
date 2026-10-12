"""
Core birthday attack functions - extracted from notebook, preserved exactly.

NOTES ON PRESERVATION:
- Truncation uses RIGHT SHIFT on full 256-bit integer (keeps MSBs)
- Collision check includes distinct-message verification (seen[h] != message)
- Random message generation uses same character set and default length (12)
- Theoretical 50% bound uses sqrt(2 * 2^bits * ln(2))
- NEW: expected_trials() implements sqrt(pi * 2^bits / 2) from report (not in notebook)
"""

import hashlib
import math
import random
import string
import time
import uuid
from dataclasses import dataclass, field
from typing import Generator, Optional, List, Tuple

# Constants matching notebook
DEFAULT_MESSAGE_LENGTH = 12
CHARACTER_SET = string.ascii_letters + string.digits
MAX_ATTEMPTS_DEFAULT = 1_000_000
MAX_BITS = 32  # Hard cap: 2^32 entries would need ~16GB+ for seen dict
MEMORY_WARN_BITS = 24  # Warn user above this


@dataclass
class AttemptSnapshot:
    """Single attempt progress snapshot for streaming."""
    attempt: int
    message: str
    full_digest: str
    truncated_value: int
    truncated_hex: str
    truncated_binary: str
    unique_hashes_count: int
    elapsed_seconds: float
    attempts_per_second: float


@dataclass
class CollisionResult:
    """Final collision result."""
    simulation_id: str
    message1: str
    message2: str
    full_digest1: str
    full_digest2: str
    truncated_value: int
    truncated_hex: str
    bits: int
    attempts: int
    elapsed_seconds: float
    theoretical_50pct: float
    expected_trials: float
    attempts_history: List[int] = field(default_factory=list)
    unique_hashes_history: List[int] = field(default_factory=list)
    stopped_early: bool = False

    @property
    def collision_found(self) -> bool:
        """True if a collision was found (both messages non-empty)."""
        return bool(self.message1 and self.message2)

    @property
    def full_digests_differ(self) -> bool:
        return self.full_digest1 != self.full_digest2


@dataclass
class ComparisonResult:
    """Result of comparing two messages."""
    message1: str
    message2: str
    full_digest1: str
    full_digest2: str
    truncated_value1: int
    truncated_value2: int
    truncated_hex1: str
    truncated_hex2: str
    bits: int
    full_match: bool
    truncated_match: bool
    messages_identical: bool


def truncate_sha256(message: str, bits: int) -> int:
    """
    Compute truncated SHA-256 - EXACTLY as in notebook.

    Takes the most significant `bits` of the 256-bit digest via right shift.
    This is the reference implementation; do not change the algorithm.
    """
    if not 1 <= bits <= 256:
        raise ValueError(f"bits must be 1-256, got {bits}")
    digest = hashlib.sha256(message.encode("utf-8")).digest()
    value = int.from_bytes(digest, "big")
    return value >> (256 - bits)


def full_sha256_hex(message: str) -> str:
    """Full SHA-256 as 64-char hex string."""
    return hashlib.sha256(message.encode("utf-8")).hexdigest()


def format_truncated_hex(truncated_value: int, bits: int) -> str:
    """Format truncated value as zero-padded hex."""
    width = (bits + 3) // 4
    return f"{truncated_value:0{width}x}"


def format_truncated_binary(truncated_value: int, bits: int) -> str:
    """Format truncated value as zero-padded binary."""
    return f"{truncated_value:0{bits}b}"


def birthday_bound_50pct(bits: int) -> float:
    """
    Theoretical 50% collision probability threshold.

    Formula: sqrt(2 * 2^bits * ln(2))  ≈ 1.1774 * 2^(bits/2)
    EXACT match to notebook's birthday_bound().
    """
    if bits < 1:
        raise ValueError("bits must be >= 1")
    return math.sqrt(2 * (2 ** bits) * math.log(2))


def expected_trials(bits: int) -> float:
    """
    Expected number of trials until first collision.

    Formula: sqrt(pi * 2^bits / 2)  ≈ 1.2533 * 2^(bits/2)
    From report Section 1.3; NOT in original notebook.
    """
    if bits < 1:
        raise ValueError("bits must be >= 1")
    return math.sqrt(math.pi * (2 ** bits) / 2)


def collision_probability(k: int, bits: int) -> float:
    """
    Probability of at least one collision after k attempts.

    P ≈ 1 - exp(-k(k-1) / 2N)  where N = 2^bits
    From report Section 1.3.
    """
    if bits < 1 or k < 0:
        raise ValueError("Invalid parameters")
    if k <= 1:
        return 0.0
    n = 2 ** bits
    return 1.0 - math.exp(-k * (k - 1) / (2 * n))


def random_message(length: int = DEFAULT_MESSAGE_LENGTH, rng: Optional[random.Random] = None) -> str:
    """
    Generate random alphanumeric message - EXACTLY as in notebook.

    Uses string.ascii_letters + string.digits, default length 12.
    Accepts optional random.Random instance for reproducible seeding.
    """
    if length < 1:
        raise ValueError("length must be >= 1")
    rng = rng or random
    return "".join(rng.choice(CHARACTER_SET) for _ in range(length))


def find_collision(
    bits: int,
    max_attempts: int = MAX_ATTEMPTS_DEFAULT,
    seed: Optional[int] = None,
    progress_interval: int = 100,
    time_interval: float = 0.1,
) -> Generator[AttemptSnapshot | CollisionResult, None, None]:
    """
    Find collision via random search - NOTEBOOK LOGIC PRESERVED.

    Yields AttemptSnapshot every `progress_interval` attempts or `time_interval` seconds,
    then yields final CollisionResult.

    Args:
        bits: Truncation bits (1-32, enforced)
        max_attempts: Maximum attempts before giving up
        seed: Optional seed for reproducible runs
        progress_interval: Yield progress every N attempts
        time_interval: Yield progress at least every N seconds

    Yields:
        AttemptSnapshot during search, then CollisionResult on success/failure
    """
    if not 1 <= bits <= MAX_BITS:
        raise ValueError(f"bits must be 1-{MAX_BITS} (server cap), got {bits}")

    rng = random.Random(seed) if seed is not None else random
    seen: dict[int, str] = {}
    attempts_history: List[int] = []
    unique_hashes_history: List[int] = []

    start_time = time.perf_counter()
    last_yield_time = start_time
    attempt = 0

    theoretical_50 = birthday_bound_50pct(bits)
    expected = expected_trials(bits)

    while attempt < max_attempts:
        attempt += 1
        message = random_message(rng=rng)
        truncated_value = truncate_sha256(message, bits)
        full_digest = full_sha256_hex(message)

        # Check for collision (EXACT notebook logic: distinct messages)
        if truncated_value in seen and seen[truncated_value] != message:
            elapsed = time.perf_counter() - start_time
            # Notebook appends collision attempt to history before returning
            attempts_history.append(attempt)
            unique_hashes_history.append(len(seen))  # Doesn't increase on collision
            result = CollisionResult(
                simulation_id=str(uuid.uuid4())[:8],
                message1=seen[truncated_value],
                message2=message,
                full_digest1=full_sha256_hex(seen[truncated_value]),
                full_digest2=full_digest,
                truncated_value=truncated_value,
                truncated_hex=format_truncated_hex(truncated_value, bits),
                bits=bits,
                attempts=attempt,
                elapsed_seconds=elapsed,
                theoretical_50pct=theoretical_50,
                expected_trials=expected,
                attempts_history=attempts_history,
                unique_hashes_history=unique_hashes_history,
            )
            yield result
            return

        # Store new hash
        seen[truncated_value] = message
        attempts_history.append(attempt)
        unique_hashes_history.append(len(seen))

        # Throttled progress yield - always yield on first attempt, then every interval
        now = time.perf_counter()
        if attempt == 1 or attempt % progress_interval == 0 or (now - last_yield_time) >= time_interval:
            elapsed = now - start_time
            yield AttemptSnapshot(
                attempt=attempt,
                message=message,
                full_digest=full_digest,
                truncated_value=truncated_value,
                truncated_hex=format_truncated_hex(truncated_value, bits),
                truncated_binary=format_truncated_binary(truncated_value, bits),
                unique_hashes_count=len(seen),
                elapsed_seconds=elapsed,
                attempts_per_second=attempt / elapsed if elapsed > 0 else 0,
            )
            last_yield_time = now

        # Memory safety: cap seen dict
        if len(seen) >= min(2 ** bits, 10_000_000):
            elapsed = time.perf_counter() - start_time
            result = CollisionResult(
                simulation_id=str(uuid.uuid4())[:8],
                message1="",
                message2="",
                full_digest1="",
                full_digest2="",
                truncated_value=0,
                truncated_hex="",
                bits=bits,
                attempts=attempt,
                elapsed_seconds=elapsed,
                theoretical_50pct=theoretical_50,
                expected_trials=expected,
                attempts_history=attempts_history,
                unique_hashes_history=unique_hashes_history,
                stopped_early=True,
            )
            yield result
            return

    # Exhausted attempts
    elapsed = time.perf_counter() - start_time
    result = CollisionResult(
        simulation_id=str(uuid.uuid4())[:8],
        message1="",
        message2="",
        full_digest1="",
        full_digest2="",
        truncated_value=0,
        truncated_hex="",
        bits=bits,
        attempts=attempt,
        elapsed_seconds=elapsed,
        theoretical_50pct=theoretical_50,
        expected_trials=expected,
        attempts_history=attempts_history,
        unique_hashes_history=unique_hashes_history,
        stopped_early=False,
    )
    yield result


def compare_messages(message1: str, message2: str, bits: int) -> ComparisonResult:
    """
    Compare two messages for full and truncated hash equality - NOTEBOOK LOGIC.

    Matches user_input_mode() behavior exactly.
    """
    if not 1 <= bits <= 256:
        raise ValueError(f"bits must be 1-256, got {bits}")

    full1 = full_sha256_hex(message1)
    full2 = full_sha256_hex(message2)

    trunc1 = truncate_sha256(message1, bits)
    trunc2 = truncate_sha256(message2, bits)

    return ComparisonResult(
        message1=message1,
        message2=message2,
        full_digest1=full1,
        full_digest2=full2,
        truncated_value1=trunc1,
        truncated_value2=trunc2,
        truncated_hex1=format_truncated_hex(trunc1, bits),
        truncated_hex2=format_truncated_hex(trunc2, bits),
        bits=bits,
        full_match=(full1 == full2),
        truncated_match=(trunc1 == trunc2),
        messages_identical=(message1 == message2),
    )