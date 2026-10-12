"""
Unit tests for birthday_lab core functions.
"""

import hashlib
import math
import pytest

from birthday_lab.core import (
    truncate_sha256,
    full_sha256_hex,
    format_truncated_hex,
    format_truncated_binary,
    birthday_bound_50pct,
    expected_trials,
    collision_probability,
    random_message,
    find_collision,
    compare_messages,
    CollisionResult,
    ComparisonResult,
)
from birthday_lab.theory import (
    bits_for_security_level,
    preimage_cost,
    collision_cost_generic,
    get_formula_latex,
    get_formula_reading,
)


class TestTruncateSHA256:
    """Test SHA-256 truncation - must match notebook exactly."""

    def test_truncate_8_bits(self):
        """Test 8-bit truncation matches notebook example."""
        # From notebook output: "rAPeSvt0LzId" -> truncated = 42 (0x2a)
        msg = "rAPeSvt0LzId"
        result = truncate_sha256(msg, 8)
        assert result == 42  # 0x2a

    def test_truncate_16_bits(self):
        """Test 16-bit truncation."""
        msg = "test message"
        result = truncate_sha256(msg, 16)
        # Verify it's the top 16 bits
        full = int(full_sha256_hex(msg), 16)
        expected = full >> (256 - 16)
        assert result == expected

    def test_truncate_edge_cases(self):
        """Test bit boundaries."""
        msg = "edge case"
        # 1 bit
        assert truncate_sha256(msg, 1) in (0, 1)
        # 4 bits (hex boundary)
        assert 0 <= truncate_sha256(msg, 4) <= 15
        # 8 bits (byte boundary)
        assert 0 <= truncate_sha256(msg, 8) <= 255
        # 256 bits (full)
        full = int(full_sha256_hex(msg), 16)
        assert truncate_sha256(msg, 256) == full

    def test_truncate_invalid_bits(self):
        """Test invalid bit values raise error."""
        with pytest.raises(ValueError):
            truncate_sha256("test", 0)
        with pytest.raises(ValueError):
            truncate_sha256("test", 257)

    def test_truncate_preserves_msbs(self):
        """Verify truncation keeps MOST SIGNIFICANT bits (right shift)."""
        # This is the critical test - notebook uses >> (256 - bits)
        # which keeps the LEFTMOST/MOST SIGNIFICANT bits
        msg = "MSB test"
        full = int(full_sha256_hex(msg), 16)
        # For 8 bits, should equal first byte of digest
        digest_bytes = hashlib.sha256(msg.encode()).digest()
        expected_msb = digest_bytes[0]  # First byte = most significant
        assert truncate_sha256(msg, 8) == expected_msb


class TestFullSHA256:
    """Test full SHA-256 helper."""

    def test_known_vector(self):
        """Test against known SHA-256 test vector."""
        # Empty string
        assert full_sha256_hex("") == (
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        )
        # "abc"
        assert full_sha256_hex("abc") == (
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        )


class TestFormatting:
    """Test hex/binary formatting."""

    def test_format_hex_padding(self):
        """Test zero-padding for various bit sizes."""
        assert format_truncated_hex(0x2a, 8) == "2a"
        assert format_truncated_hex(0x0a, 8) == "0a"
        assert format_truncated_hex(0xabc, 12) == "abc"
        assert format_truncated_hex(0x0abc, 16) == "0abc"

    def test_format_binary_padding(self):
        """Test binary formatting."""
        assert format_truncated_binary(0b1010, 4) == "1010"
        assert format_truncated_binary(0b101, 4) == "0101"
        assert format_truncated_binary(0b1, 8) == "00000001"


class TestTheory:
    """Test theoretical formulas."""

    def test_birthday_bound_50pct(self):
        """Test 50% bound formula matches notebook."""
        # 8 bits: sqrt(2 * 256 * ln(2)) = 18.84...
        bound = birthday_bound_50pct(8)
        assert abs(bound - 18.84) < 0.02

        # 16 bits
        bound = birthday_bound_50pct(16)
        expected = math.sqrt(2 * 65536 * math.log(2))
        assert abs(bound - expected) < 0.001

    def test_expected_trials(self):
        """Test expected trials formula (from report, not notebook)."""
        # 8 bits: sqrt(pi * 256 / 2) = 20.06...
        exp = expected_trials(8)
        assert abs(exp - 20.06) < 0.02

        # Relationship: expected_trials > bound_50pct (since 1.2533 > 1.1774)
        for bits in range(1, 33):
            assert expected_trials(bits) > birthday_bound_50pct(bits)

    def test_collision_probability(self):
        """Test collision probability formula."""
        # P(0) = 0, P(1) = 0
        assert collision_probability(0, 8) == 0.0
        assert collision_probability(1, 8) == 0.0

        # At bound_50pct, P ≈ 0.5
        bound = int(birthday_bound_50pct(16))
        prob = collision_probability(bound, 16)
        assert 0.4 < prob < 0.6

    def test_bits_for_security(self):
        """Test security rule: digest bits >= 2 * collision security bits."""
        assert bits_for_security_level(128) == 256
        assert bits_for_security_level(80) == 160

    def test_cost_functions(self):
        """Test cost formulas."""
        assert preimage_cost(8) == 256
        assert collision_cost_generic(8) == 16  # 2^(8/2)


class TestRandomMessage:
    """Test random message generation."""

    def test_default_length(self):
        """Default length is 12."""
        msg = random_message()
        assert len(msg) == 12

    def test_custom_length(self):
        """Custom length respected."""
        msg = random_message(20)
        assert len(msg) == 20

    def test_character_set(self):
        """Only alphanumeric characters."""
        msg = random_message(100)
        assert all(c in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" for c in msg)

    def test_seed_reproducibility(self):
        """Same seed produces same sequence."""
        rng1 = __import__("random").Random(42)
        rng2 = __import__("random").Random(42)
        msgs1 = [random_message(rng=rng1) for _ in range(5)]
        msgs2 = [random_message(rng=rng2) for _ in range(5)]
        assert msgs1 == msgs2

    def test_invalid_length(self):
        """Invalid length raises error."""
        with pytest.raises(ValueError):
            random_message(0)


class TestCompareMessages:
    """Test message comparison - matches notebook user_input_mode."""

    def test_identical_messages(self):
        """Identical messages match on both full and truncated."""
        result = compare_messages("hello", "hello", 16)
        assert result.messages_identical is True
        assert result.full_match is True
        assert result.truncated_match is True

    def test_different_messages_no_collision(self):
        """Different messages typically don't collide."""
        result = compare_messages("hello", "world", 16)
        assert result.messages_identical is False
        assert result.full_match is False
        assert result.truncated_match is False

    def test_truncated_collision_possible(self):
        """Truncated collision possible with small bits."""
        # With 1 bit, 50% chance of collision
        collisions = 0
        for i in range(100):
            result = compare_messages(f"msg{i}a", f"msg{i}b", 1)
            if result.truncated_match:
                collisions += 1
        assert collisions > 0  # Should find some

    def test_full_collision_unlikely(self):
        """Full SHA-256 collision is astronomically unlikely."""
        # This test just ensures the flag works
        result = compare_messages("a", "b", 256)
        assert result.full_match is False


class TestFindCollision:
    """Test collision search - parity with notebook."""

    def test_collision_found_structure(self):
        """Collision result has all required fields."""
        # Run with very small bits for fast test
        gen = find_collision(bits=4, max_attempts=1000, seed=42)
        result = None
        for item in gen:
            if isinstance(item, CollisionResult):
                result = item
                break

        assert result is not None
        assert result.collision_found is True
        assert result.message1 != result.message2  # Distinct messages
        assert result.truncated_value == truncate_sha256(result.message1, 4)
        assert result.truncated_value == truncate_sha256(result.message2, 4)
        assert result.full_digest1 != result.full_digest2  # Full digests differ
        assert result.attempts > 0
        assert result.elapsed_seconds > 0
        assert len(result.attempts_history) == result.attempts
        assert len(result.unique_hashes_history) == result.attempts

    def test_progress_snapshots(self):
        """Progress snapshots yielded during search."""
        gen = find_collision(bits=6, max_attempts=1000, seed=123)
        snapshots = []
        result = None
        for item in gen:
            if isinstance(item, CollisionResult):
                result = item
            else:
                snapshots.append(item)

        assert len(snapshots) > 0
        assert result is not None
        # Check snapshot structure
        snap = snapshots[0]
        assert hasattr(snap, "attempt")
        assert hasattr(snap, "message")
        assert hasattr(snap, "full_digest")
        assert hasattr(snap, "truncated_value")
        assert hasattr(snap, "truncated_hex")
        assert hasattr(snap, "truncated_binary")
        assert hasattr(snap, "unique_hashes_count")
        assert hasattr(snap, "elapsed_seconds")
        assert hasattr(snap, "attempts_per_second")

    def test_seed_reproducibility(self):
        """Same seed produces identical collision."""
        gen1 = find_collision(bits=8, max_attempts=10000, seed=999)
        gen2 = find_collision(bits=8, max_attempts=10000, seed=999)

        result1 = next(item for item in gen1 if isinstance(item, CollisionResult))
        result2 = next(item for item in gen2 if isinstance(item, CollisionResult))

        assert result1.message1 == result2.message1
        assert result1.message2 == result2.message2
        assert result1.attempts == result2.attempts
        assert result1.truncated_hex == result2.truncated_hex


class TestFormulas:
    """Test formula LaTeX and readings."""

    def test_formula_latex_exists(self):
        """All formulas have LaTeX."""
        for key in [
            "collision_probability_exact",
            "collision_probability_approx",
            "bound_50pct",
            "expected_trials",
            "preimage_cost",
            "collision_cost_generic",
            "security_rule",
        ]:
            latex = get_formula_latex(key)
            assert latex
            assert isinstance(latex, str)

    def test_formula_reading_exists(self):
        """All formulas have plain-language reading."""
        for key in [
            "collision_probability_exact",
            "collision_probability_approx",
            "bound_50pct",
            "expected_trials",
            "preimage_cost",
            "collision_cost_generic",
            "security_rule",
        ]:
            reading = get_formula_reading(key)
            assert reading
            assert isinstance(reading, str)
            assert len(reading) > 20  # Substantial explanation