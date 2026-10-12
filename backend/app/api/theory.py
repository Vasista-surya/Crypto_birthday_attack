"""
Theory API endpoints - theoretical metrics and chart data.
"""

from fastapi import APIRouter, HTTPException, Query

from app.schemas import (
    TheoryRequest,
    TheoryResponse,
    TheorySeriesRequest,
    TheorySeriesResponse,
    BatchExperimentRequest,
    BatchExperimentResponse,
    ErrorResponse,
)
from app.services import get_theory, get_theory_series
from birthday_lab.core import find_collision, CollisionResult

router = APIRouter(prefix="/api/theory", tags=["theory"])


@router.get(
    "",
    response_model=TheoryResponse,
    responses={400: {"model": ErrorResponse}},
)
async def theory_get(bits: int = Query(ge=1, le=256)) -> TheoryResponse:
    """Get theoretical metrics for a given bit size."""
    try:
        data = get_theory(bits)
        return TheoryResponse(**data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/series",
    response_model=TheorySeriesResponse,
    responses={400: {"model": ErrorResponse}},
)
async def theory_series_get(
    min_bits: int = Query(default=8, ge=1, le=32),
    max_bits: int = Query(default=32, ge=1, le=32),
    step: int = Query(default=1, ge=1, le=4),
) -> TheorySeriesResponse:
    """Get theory curve data for charting (log scale)."""
    if min_bits > max_bits:
        raise HTTPException(status_code=400, detail="min_bits must be <= max_bits")
    try:
        data = get_theory_series(min_bits, max_bits, step)
        return TheorySeriesResponse(**data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post(
    "/batch",
    response_model=BatchExperimentResponse,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
)
async def batch_experiment(request: BatchExperimentRequest) -> BatchExperimentResponse:
    """
    Run multiple independent collision searches at fixed bit size.

    Returns histogram data: attempts distribution with theoretical markers.
    Limited to 24 bits max for reasonable completion time.
    """
    if request.bits > 24:
        raise HTTPException(status_code=400, detail="Batch experiments limited to 24 bits max")

    attempts_list = []
    completed = 0

    for trial in range(request.trials):
        # Use derived seed for each trial if base seed provided
        trial_seed = None
        if request.seed is not None:
            trial_seed = request.seed + trial * 10007  # Prime offset

        result: CollisionResult | None = None
        async for item in find_collision(
            bits=request.bits,
            max_attempts=1_000_000,
            seed=trial_seed,
            progress_interval=10000,  # Less frequent progress for batch
            time_interval=1.0,
        ):
            if isinstance(item, CollisionResult):
                result = item
                break

        if result and result.collision_found:
            attempts_list.append(result.attempts)
            completed += 1

    if not attempts_list:
        # No collisions found in any trial
        return BatchExperimentResponse(
            bits=request.bits,
            trials_requested=request.trials,
            trials_completed=0,
            attempts_list=[],
            mean_attempts=0,
            median_attempts=0,
            min_attempts=0,
            max_attempts=0,
            theoretical_50pct=0,
            expected_trials=0,
        )

    attempts_list.sort()
    mean_attempts = sum(attempts_list) / len(attempts_list)
    median_attempts = attempts_list[len(attempts_list) // 2]
    min_attempts = attempts_list[0]
    max_attempts = attempts_list[-1]

    theoretical_50 = get_theory(request.bits)["bound_50pct"]
    expected = get_theory(request.bits)["expected_trials"]

    return BatchExperimentResponse(
        bits=request.bits,
        trials_requested=request.trials,
        trials_completed=completed,
        attempts_list=attempts_list,
        mean_attempts=mean_attempts,
        median_attempts=median_attempts,
        min_attempts=min_attempts,
        max_attempts=max_attempts,
        theoretical_50pct=theoretical_50,
        expected_trials=expected,
    )