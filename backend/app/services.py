"""
Simulation management service - handles lifecycle, SSE streaming, and concurrency.
"""

import asyncio
import time
import uuid
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from typing import AsyncGenerator, Dict, Optional

from birthday_lab.core import (
    find_collision,
    compare_messages,
    CollisionResult,
    AttemptSnapshot,
    ComparisonResult,
)
from birthday_lab.theory import (
    birthday_bound_50pct,
    expected_trials,
    theory_series,
    get_formula_latex,
    get_formula_reading,
)


@dataclass
class SimulationState:
    """Tracks an active simulation."""
    simulation_id: str
    bits: int
    seed: Optional[int]
    max_attempts: int
    task: Optional[asyncio.Task] = None
    generator: Optional[AsyncGenerator] = None
    created_at: float = field(default_factory=time.time)
    last_progress: Optional[AttemptSnapshot] = None
    final_result: Optional[CollisionResult] = None
    cancelled: bool = False


class SimulationManager:
    """Manages concurrent simulations with SSE streaming."""

    def __init__(self, max_concurrent: int = 10):
        self._simulations: Dict[str, SimulationState] = {}
        self._max_concurrent = max_concurrent
        self._cleanup_interval = 300  # 5 minutes
        self._last_cleanup = time.time()

    async def start_simulation(
        self,
        bits: int,
        seed: Optional[int] = None,
        max_attempts: int = 1_000_000,
    ) -> SimulationState:
        """Start a new collision search simulation."""
        # Cleanup stale simulations periodically
        await self._maybe_cleanup()

        if len(self._simulations) >= self._max_concurrent:
            raise RuntimeError(f"Max concurrent simulations ({self._max_concurrent}) reached")

        sim_id = str(uuid.uuid4())[:8]
        state = SimulationState(
            simulation_id=sim_id,
            bits=bits,
            seed=seed,
            max_attempts=max_attempts,
        )
        self._simulations[sim_id] = state

        # Start the generator in background
        state.generator = self._run_generator(state)
        state.task = asyncio.create_task(self._consume_generator(state))

        return state

    async def _run_generator(self, state: SimulationState) -> AsyncGenerator:
        """Run the synchronous generator in a thread pool."""
        loop = asyncio.get_event_loop()
        # Wrap sync generator to async
        def sync_gen():
            yield from find_collision(
                bits=state.bits,
                max_attempts=state.max_attempts,
                seed=state.seed,
                progress_interval=50,
                time_interval=0.1,
            )

        # Run in executor to avoid blocking event loop
        gen = sync_gen()
        while True:
            try:
                item = await loop.run_in_executor(None, lambda: next(gen))
                yield item
            except StopIteration:
                break

    async def _consume_generator(self, state: SimulationState) -> None:
        """Consume generator and update state."""
        try:
            async for item in state.generator:
                if state.cancelled:
                    break
                if isinstance(item, AttemptSnapshot):
                    state.last_progress = item
                elif isinstance(item, CollisionResult):
                    state.final_result = item
                    break
        except asyncio.CancelledError:
            state.cancelled = True
        except Exception as e:
            state.final_result = CollisionResult(
                simulation_id=state.simulation_id,
                message1="",
                message2="",
                full_digest1="",
                full_digest2="",
                truncated_value=0,
                truncated_hex="",
                bits=state.bits,
                attempts=0,
                elapsed_seconds=0,
                theoretical_50pct=birthday_bound_50pct(state.bits),
                expected_trials=expected_trials(state.bits),
                stopped_early=True,
            )
            # Store error in a way we can detect
            state.final_result.message1 = f"ERROR: {str(e)}"

    async def stop_simulation(self, simulation_id: str) -> bool:
        """Stop a running simulation."""
        state = self._simulations.get(simulation_id)
        if not state:
            return False
        if state.task and not state.task.done():
            state.cancelled = True
            state.task.cancel()
            try:
                await state.task
            except asyncio.CancelledError:
                pass
        return True

    def get_state(self, simulation_id: str) -> Optional[SimulationState]:
        """Get simulation state by ID."""
        return self._simulations.get(simulation_id)

    def get_progress(self, simulation_id: str) -> Optional[AttemptSnapshot]:
        """Get latest progress snapshot."""
        state = self._simulations.get(simulation_id)
        return state.last_progress if state else None

    def get_result(self, simulation_id: str) -> Optional[CollisionResult]:
        """Get final result if available."""
        state = self._simulations.get(simulation_id)
        return state.final_result if state else None

    async def _maybe_cleanup(self) -> None:
        """Remove completed/old simulations."""
        now = time.time()
        if now - self._last_cleanup < self._cleanup_interval:
            return

        to_remove = []
        for sim_id, state in self._simulations.items():
            # Remove if completed > 5 min ago or cancelled > 1 min ago
            age = now - state.created_at
            if state.final_result and age > 300:
                to_remove.append(sim_id)
            elif state.cancelled and age > 60:
                to_remove.append(sim_id)

        for sim_id in to_remove:
            del self._simulations[sim_id]

        self._last_cleanup = now

    async def cleanup_all(self) -> None:
        """Stop all simulations and clear."""
        for state in self._simulations.values():
            if state.task and not state.task.done():
                state.cancelled = True
                state.task.cancel()
        self._simulations.clear()


# Theory service functions
def get_theory(bits: int) -> dict:
    """Get theoretical metrics for a given bit size."""
    bound_50 = birthday_bound_50pct(bits)
    exp_trials = expected_trials(bits)
    return {
        "bits": bits,
        "bound_50pct": bound_50,
        "expected_trials": exp_trials,
        "bound_50pct_formula": get_formula_latex("bound_50pct"),
        "expected_trials_formula": get_formula_latex("expected_trials"),
        "bound_50pct_reading": get_formula_reading("bound_50pct"),
        "expected_trials_reading": get_formula_reading("expected_trials"),
        "worked_example": _worked_example(bits, bound_50, exp_trials),
    }


def get_theory_series(min_bits: int, max_bits: int, step: int) -> dict:
    """Get theory curve data for charting."""
    return theory_series(min_bits, max_bits, step)


def compare_messages_service(message1: str, message2: str, bits: int) -> ComparisonResult:
    """Compare two messages."""
    return compare_messages(message1, message2, bits)


def _worked_example(bits: int, bound_50: float, exp_trials: float) -> str:
    """Generate a worked numeric example."""
    n = 2 ** bits
    return (
        f"For n = {bits} bits (N = 2^{bits} = {n:,} possible outputs):\n"
        f"• 50% collision threshold: √(2 × {n:,} × ln(2)) ≈ {bound_50:,.2f} attempts\n"
        f"• Expected trials to first collision: √(π × {n:,} / 2) ≈ {exp_trials:,.2f} attempts\n"
        f"• Preimage resistance (brute force): 2^{bits} = {2**bits:,} attempts\n"
        f"• Collision resistance (generic): 2^{bits/2} = {2**(bits/2):,.0f} attempts"
    )


# Global manager instance
simulation_manager = SimulationManager()