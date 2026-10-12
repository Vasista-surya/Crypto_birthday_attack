"""
Simulation API endpoints - start, stream (SSE), stop.
"""

import asyncio
import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

from app.schemas import (
    SimulationStartRequest,
    SimulationStartResponse,
    SimulationStopRequest,
    SimulationStopResponse,
    AttemptSnapshot,
    CollisionResult,
    ErrorResponse,
)
from app.services import simulation_manager

router = APIRouter(prefix="/api/simulations", tags=["simulations"])


@router.post(
    "",
    response_model=SimulationStartResponse,
    responses={400: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
async def start_simulation(request: SimulationStartRequest) -> SimulationStartResponse:
    """Start a new collision search simulation."""
    try:
        state = await simulation_manager.start_simulation(
            bits=request.bits,
            seed=request.seed,
            max_attempts=request.max_attempts,
        )
        return SimulationStartResponse(
            simulation_id=state.simulation_id,
            bits=state.bits,
            theoretical_50pct=state.final_result.theoretical_50pct if state.final_result else 0,
            expected_trials=state.final_result.expected_trials if state.final_result else 0,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/{simulation_id}/stream",
    responses={404: {"model": ErrorResponse}},
)
async def stream_simulation(simulation_id: str, request: Request) -> EventSourceResponse:
    """
    Server-Sent Events stream for simulation progress.

    Yields:
    - AttemptSnapshot events (throttled)
    - CollisionResult event (final)
    - Error event if simulation failed
    """
    state = simulation_manager.get_state(simulation_id)
    if not state:
        raise HTTPException(status_code=404, detail="Simulation not found")

    async def event_generator() -> AsyncGenerator[dict, None]:
        # Send initial theoretical values immediately
        yield {
            "event": "theory",
            "data": json.dumps({
                "bits": state.bits,
                "theoretical_50pct": birthday_bound_50pct(state.bits),
                "expected_trials": expected_trials(state.bits),
            })
        }

        last_sent_attempt = 0
        last_sent_time = asyncio.get_event_loop().time()

        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break

            # Check for final result
            result = simulation_manager.get_result(simulation_id)
            if result:
                if result.message1.startswith("ERROR:"):
                    yield {
                        "event": "error",
                        "data": json.dumps({"error": result.message1[7:]})
                    }
                else:
                    yield {
                        "event": "result",
                        "data": result.model_dump_json()
                    }
                break

            # Check for progress update
            progress = simulation_manager.get_progress(simulation_id)
            if progress and (progress.attempt != last_sent_attempt):
                # Throttle: at most every 50 attempts or 100ms
                now = asyncio.get_event_loop().time()
                if (progress.attempt - last_sent_attempt >= 50) or (now - last_sent_time >= 0.1):
                    yield {
                        "event": "progress",
                        "data": progress.model_dump_json()
                    }
                    last_sent_attempt = progress.attempt
                    last_sent_time = now

            # Check if cancelled
            if state.cancelled:
                yield {
                    "event": "stopped",
                    "data": json.dumps({"message": "Simulation stopped by user"})
                }
                break

            await asyncio.sleep(0.05)  # Small delay to prevent busy loop

    return EventSourceResponse(event_generator())


@router.post(
    "/{simulation_id}/stop",
    response_model=SimulationStopResponse,
    responses={404: {"model": ErrorResponse}},
)
async def stop_simulation(simulation_id: str) -> SimulationStopResponse:
    """Stop a running simulation."""
    stopped = await simulation_manager.stop_simulation(simulation_id)
    if not stopped:
        raise HTTPException(status_code=404, detail="Simulation not found")
    return SimulationStopResponse(
        simulation_id=simulation_id,
        stopped=True,
        message="Simulation stopped"
    )


# Import here to avoid circular import
from birthday_lab.theory import birthday_bound_50pct, expected_trials