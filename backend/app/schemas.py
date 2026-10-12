"""
Pydantic schemas for API request/response validation.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class SimulationStartRequest(BaseModel):
    bits: int = Field(ge=1, le=32, description="Truncation bits (1-32)")
    seed: Optional[int] = Field(default=None, description="Optional seed for reproducible runs")
    max_attempts: Optional[int] = Field(default=1_000_000, ge=1, le=10_000_000)

    @field_validator("bits")
    @classmethod
    def validate_bits(cls, v: int) -> int:
        if v > 32:
            raise ValueError("Maximum 32 bits enforced (memory safety). Full SHA-256 collision is infeasible.")
        return v


class SimulationStartResponse(BaseModel):
    simulation_id: str
    bits: int
    theoretical_50pct: float
    expected_trials: float
    message: str = "Simulation started. Connect to /stream for progress."


class SimulationStopRequest(BaseModel):
    simulation_id: str


class SimulationStopResponse(BaseModel):
    simulation_id: str
    stopped: bool
    message: str


class AttemptSnapshot(BaseModel):
    attempt: int
    message: str
    full_digest: str
    truncated_value: int
    truncated_hex: str
    truncated_binary: str
    unique_hashes_count: int
    elapsed_seconds: float
    attempts_per_second: float


class CollisionResult(BaseModel):
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
    attempts_history: List[int] = []
    unique_hashes_history: List[int] = []
    stopped_early: bool = False
    collision_found: bool = True

    @property
    def full_digests_differ(self) -> bool:
        return self.full_digest1 != self.full_digest2


class CompareRequest(BaseModel):
    message1: str = Field(min_length=1, max_length=10_000)
    message2: str = Field(min_length=1, max_length=10_000)
    bits: int = Field(ge=1, le=256)


class CompareResponse(BaseModel):
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
    explanation: str


class TheoryRequest(BaseModel):
    bits: int = Field(ge=1, le=256)


class TheoryResponse(BaseModel):
    bits: int
    bound_50pct: float
    expected_trials: float
    bound_50pct_formula: str
    expected_trials_formula: str
    bound_50pct_reading: str
    expected_trials_reading: str
    worked_example: str


class TheorySeriesRequest(BaseModel):
    min_bits: int = Field(default=8, ge=1, le=32)
    max_bits: int = Field(default=32, ge=1, le=32)
    step: int = Field(default=1, ge=1, le=4)


class TheorySeriesResponse(BaseModel):
    bits: List[int]
    bound_50pct: List[float]
    expected_trials: List[float]
    preimage_cost: List[float]
    collision_cost_generic: List[float]


class BatchExperimentRequest(BaseModel):
    bits: int = Field(ge=1, le=24, description="Limited to 24 bits for batch runs")
    trials: int = Field(ge=1, le=100, description="Number of independent runs")
    seed: Optional[int] = None


class BatchExperimentResponse(BaseModel):
    bits: int
    trials_requested: int
    trials_completed: int
    attempts_list: List[int]
    mean_attempts: float
    median_attempts: float
    min_attempts: int
    max_attempts: int
    theoretical_50pct: float
    expected_trials: float


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "Birthday Attack Lab API"
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None