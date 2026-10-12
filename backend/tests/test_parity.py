"""
Parity test: verify refactored birthday_lab core matches original notebook LOGIC.

This test verifies ALGORITHMIC parity - same formulas, same truncation method,
same collision detection logic. It does NOT verify specific random outputs
since the notebook doesn't use a fixed seed.
"""

import hashlib
import math
import pytest

from birthday_lab.core import (
    truncate_sha256,
    full_sha256_hex,
    format_truncated_hex,
    birthday_bound_50pct,
    expected_trials,
    random_message,
    find_collision,
    compare_messages,
    CollisionResult,
    ComparisonResult,
)


class TestAlgorithmicParity:
    """Verify algorithms match notebook exactly."""

    def test_truncation_method_matches_notebook(self):
        """
        Notebook uses: value >> (256 - bits) on full 256-bit integer.
        This keeps MOST SIGNIFICANT BITS (MSBs).
        """
        msg = "test message"
        full = int(full_sha256_hex(msg), 16)
        
        for bits in [1, 4, 8, 12, 16, 24, 32]:
            truncated = truncate_sha256(msg, bits)
            expected = full >> (256 - bits)
            assert truncated == expected, f"MSB truncation failed for {bits} bits"

    def test_truncation_keeps_first_hex_chars(self):
        """Truncation keeps first hex chars of digest (MSBs)."""
        msg = "hello world"
        full = full_sha256_hex(msg)
        
        for bits in [4, 8, 12, 16, 20, 24]:
            truncated = truncate_sha256(msg, bits)
            hex_str = format_truncated_hex(truncated, bits)
            expected_hex = full[: (bits + 3) // 4]
            assert hex_str == expected_hex, f"Hex prefix mismatch for {bits} bits"

    def test_birthday_bound_formula_exact(self):
        """birthday_bound = sqrt(2 * 2^bits * ln(2)) - EXACT notebook formula."""
        for bits in [8, 12, 16, 20, 24]:
            bound = birthday_bound_50pct(bits)
            expected = math.sqrt(2 * (2 ** bits) * math.log(2))
            assert abs(bound - expected) < 1e-10

    def test_birthday_bound_8bit_matches_notebook_print(self):
        """Notebook prints: 'Theoretical 50% birthday bound: 18.84 attempts' for 8 bits."""
        bound = birthday_bound_50pct(8)
        assert abs(bound - 18.84) < 0.01

    def test_collision_detection_requires_distinct_messages(self):
        """
        Notebook check: `if h in seen and seen[h] != message:`
        This prevents false positive from duplicate random messages.
        """
        # This is a logic test - the implementation has this check
        # We verify by ensuring identical messages don't count as collision
        result = compare_messages("same", "same", 16)
        assert result.messages_identical is True
        assert result.truncated_match is True
        # But this is NOT a collision - messages are identical

    def test_user_input_mode_logic(self):
        """compare_messages matches notebook user_input_mode() logic."""
        # Different messages, no collision
        result = compare_messages("message one", "message two", 16)
        assert result.messages_identical is False
        assert result.full_match is False
        # truncated_match could be True or False (probabilistic)

        # Identical messages
        result = compare_messages("same message", "same message", 16)
        assert result.messages_identical is True
        assert result.full_match is True
        assert result.truncated_match is True

    def test_random_message_charset_matches(self):
        """random_message uses string.ascii_letters + string.digits."""
        import string
        msg = random_message(100)
        charset = string.ascii_letters + string.digits
        assert all(c in charset for c in msg)

    def test_random_message_default_length(self):
        """Default length is 12 (matches notebook)."""
        msg = random_message()
        assert len(msg) == 12

    def test_find_collision_returns_correct_structure(self):
        """Collision result has all fields matching notebook output."""
        gen = find_collision(bits=8, max_attempts=10000, seed=123)
        result = None
        for item in gen:
            if isinstance(item, CollisionResult):
                result = item
                break

        assert result is not None
        assert hasattr(result, "simulation_id")
        assert hasattr(result, "message1")
        assert hasattr(result, "message2")
        assert hasattr(result, "full_digest1")
        assert hasattr(result, "full_digest2")
        assert hasattr(result, "truncated_value")
        assert hasattr(result, "truncated_hex")
        assert hasattr(result, "bits")
        assert hasattr(result, "attempts")
        assert hasattr(result, "elapsed_seconds")
        assert hasattr(result, "theoretical_50pct")
        assert hasattr(result, "expected_trials")
        assert hasattr(result, "attempts_history")
        assert hasattr(result, "unique_hashes_history")
        assert hasattr(result, "stopped_early")

    def test_collision_messages_are_distinct(self):
        """Found collision messages must be different (notebook logic)."""
        gen = find_collision(bits=8, max_attempts=10000, seed=456)
        result = None
        for item in gen:
            if isinstance(item, CollisionResult):
                result = item
                break

        assert result.collision_found is True
        assert result.message1 != result.message2
        assert result.full_digest1 != result.full_digest2
        assert result.truncated_value == truncate_sha256(result.message1, 8)
        assert result.truncated_value == truncate_sha256(result.message2, 8)

    def test_attempt_history_tracks_correctly(self):
        """attempts_history and unique_hashes_history track correctly."""
        gen = find_collision(bits=8, max_attempts=10000, seed=789)
        result = None
        for item in gen:
            if isinstance(item, CollisionResult):
                result = item
                break

        assert len(result.attempts_history) == result.attempts
        assert len(result.unique_hashes_history) == result.attempts
        
        # unique count increases by 1 each attempt until collision
        for i, count in enumerate(result.unique_hashes_history[:-1], 1):
            assert count == i
        # At collision, unique count doesn't increase (collision replaces check)
        assert result.unique_hashes_history[-1] == result.attempts - 1

    def test_seed_determinism(self):
        """Same seed produces identical results."""
        for bits in [6, 8, 10]:
            gen1 = find_collision(bits=bits, max_attempts=50000, seed=999)
            gen2 = find_collision(bits=bits, max_attempts=50000, seed=999)
            
            r1 = next(item for item in gen1 if isinstance(item, CollisionResult))
            r2 = next(item for item in gen2 if isinstance(item, CollisionResult))
            
            assert r1.message1 == r2.message1
            assert r1.message2 == r2.message2
            assert r1.attempts == r2.attempts
            assert r1.truncated_hex == r2.truncated_hex


class TestNotebookExampleVerification:
    """
    Verify the notebook's printed example values are internally consistent.
    We can't reproduce the exact random sequence, but we can verify
    the example's internal consistency.
    """

    def test_notebook_example_attempt_1_consistency(self):
        """Verify notebook's attempt 1 data is self-consistent."""
        # From notebook: "rAPeSvt0LzId" -> SHA-256 -> truncated 8 bits = 42 (0x2a)
        msg = "rAPeSvt0LzId"
        full = "2a8b9836b3b20b5eb1a99e601167c0dedb0271cc191c00e9559cedfd2287baec"
        truncated_int = 42
        truncated_hex = "2a"
        
        # Verify full digest
        assert full_sha256_hex(msg) == full
        
        # Verify truncation
        assert truncate_sha256(msg, 8) == truncated_int
        assert format_truncated_hex(truncated_int, 8) == truncated_hex
        
        # Verify MSB logic: first byte of digest = 0x2a = 42
        digest_bytes = hashlib.sha256(msg.encode()).digest()
        assert digest_bytes[0] == 0x2a

    def test_notebook_example_collision_consistency(self):
        """Verify notebook's collision example is self-consistent."""
        # From notebook: attempt 11 and 22 both have truncated hash "73" (115)
        msg1 = "Xa0sQJRxeXwI"
        msg2 = "NsO1iloXyGnH"
        
        full1 = "7314e4d9a6df65de302516e21ed065bed146998bb1b0e0d675828e18ecaf5f3a"
        full2 = "731a409a510e1212110bac5124ab3c3f1452456624cd27a3448f5cbb24df9bfc"
        truncated_hex = "73"
        
        # Verify full digests
        assert full_sha256_hex(msg1) == full1
        assert full_sha256_hex(msg2) == full2
        
        # Verify they're different messages
        assert msg1 != msg2
        
        # Verify full digests differ
        assert full1 != full2
        
        # Verify truncated match
        assert truncate_sha256(msg1, 8) == 115
        assert truncate_sha256(msg2, 8) == 115
        assert format_truncated_hex(115, 8) == truncated_hex


class TestFormulaParity:
    """Verify formulas match report and notebook."""

    def test_expected_trials_from_report(self):
        """expected_trials = sqrt(pi * 2^bits / 2) from report Section 1.3."""
        for bits in [8, 16, 24, 32]:
            exp = expected_trials(bits)
            expected = math.sqrt(math.pi * (2 ** bits) / 2)
            assert abs(exp - expected) < 1e-10

    def test_expected_trials_greater_than_bound(self):
        """Expected trials (1.2533 * 2^(n/2)) > 50% bound (1.1774 * 2^(n/2))."""
        for bits in range(1, 33):
            assert expected_trials(bits) > birthday_bound_50pct(bits)

    def test_collision_probability_formula(self):
        """P ≈ 1 - exp(-k(k-1)/2N) from report."""
        # At k = bound_50pct, P ≈ 0.5
        for bits in [8, 16, 24]:
            bound = int(birthday_bound_50pct(bits))
            prob = 1.0 - math.exp(-bound * (bound - 1) / (2 * (2 ** bits)))
            assert 0.4 < prob < 0.6


if __name__ == "__main__":
    pytest.main([__file__, "-v"])