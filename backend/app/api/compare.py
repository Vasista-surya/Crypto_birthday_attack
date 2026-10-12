"""
Comparison API endpoint - compare two messages for hash equality.
"""

from fastapi import APIRouter, HTTPException

from app.schemas import CompareRequest, CompareResponse, ErrorResponse
from app.services import compare_messages_service

router = APIRouter(prefix="/api", tags=["comparison"])


@router.post(
    "/compare",
    response_model=CompareResponse,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
)
async def compare_messages(request: CompareRequest) -> CompareResponse:
    """
    Compare two messages for full and truncated hash equality.

    Returns both full SHA-256 digests, truncated values, and match verdicts.
    """
    try:
        result = compare_messages_service(request.message1, request.message2, request.bits)

        # Build adaptive explanation
        explanation = _build_explanation(result)

        return CompareResponse(
            message1=result.message1,
            message2=result.message2,
            full_digest1=result.full_digest1,
            full_digest2=result.full_digest2,
            truncated_value1=result.truncated_value1,
            truncated_value2=result.truncated_value2,
            truncated_hex1=result.truncated_hex1,
            truncated_hex2=result.truncated_hex2,
            bits=result.bits,
            full_match=result.full_match,
            truncated_match=result.truncated_match,
            messages_identical=result.messages_identical,
            explanation=explanation,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def _build_explanation(result) -> str:
    """Build adaptive explanation based on comparison result."""
    if result.messages_identical:
        return (
            "Both messages are identical. Their hashes match trivially — this is NOT a collision. "
            "A collision requires TWO DIFFERENT messages with the same hash."
        )

    if result.full_match:
        return (
            "FULL SHA-256 COLLISION FOUND! This would be a monumental cryptographic break. "
            "However, this is astronomically unlikely for SHA-256. Verify the messages are truly different."
        )

    if result.truncated_match:
        return (
            f"TRUNCATED COLLISION: The two different messages produce the same {result.bits}-bit truncated hash "
            f"({result.truncated_hex1}). However, their FULL SHA-256 digests are DIFFERENT. "
            f"This demonstrates the birthday paradox on a reduced hash space only. "
            f"It does NOT mean SHA-256 is broken."
        )

    return (
        f"No collision at {result.bits} bits. The truncated hashes differ "
        f"({result.truncated_hex1} vs {result.truncated_hex2}). "
        f"Full SHA-256 digests also differ as expected."
    )