"""
Birthday Attack Lab - Core Cryptographic Functions

Pure, framework-independent implementation extracted from the reference notebook.
All algorithms, formulas, and truncation semantics are preserved exactly.
"""

from .core import (
    truncate_sha256,
    birthday_bound_50pct,
    expected_trials,
    random_message,
    find_collision,
    compare_messages,
    CollisionResult,
    ComparisonResult,
)
from .theory import (
    collision_probability,
    birthday_bound_50pct as _bound_50,
    expected_trials as _expected,
)

__all__ = [
    "truncate_sha256",
    "birthday_bound_50pct",
    "expected_trials",
    "random_message",
    "find_collision",
    "compare_messages",
    "CollisionResult",
    "ComparisonResult",
    "collision_probability",
]

__version__ = "1.0.0"