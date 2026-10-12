const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.detail || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Simulations
export interface SimulationStartRequest {
  bits: number;
  seed?: number;
  max_attempts?: number;
}

export interface SimulationStartResponse {
  simulation_id: string;
  bits: number;
  theoretical_50pct: number;
  expected_trials: number;
  message: string;
}

export interface AttemptSnapshot {
  attempt: number;
  message: string;
  full_digest: string;
  truncated_value: number;
  truncated_hex: string;
  truncated_binary: string;
  unique_hashes_count: number;
  elapsed_seconds: number;
  attempts_per_second: number;
}

export interface CollisionResult {
  simulation_id: string;
  message1: string;
  message2: string;
  full_digest1: string;
  full_digest2: string;
  truncated_value: number;
  truncated_hex: string;
  bits: number;
  attempts: number;
  elapsed_seconds: number;
  theoretical_50pct: number;
  expected_trials: number;
  attempts_history: number[];
  unique_hashes_history: number[];
  stopped_early: boolean;
  collision_found: boolean;
  full_digests_differ: boolean;
}

export async function startSimulation(params: SimulationStartRequest): Promise<SimulationStartResponse> {
  return request('/simulations', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function stopSimulation(simulationId: string): Promise<{ simulation_id: string; stopped: boolean; message: string }> {
  return request(`/simulations/${simulationId}/stop`, {
    method: 'POST',
  });
}

export function streamSimulation(
  simulationId: string,
  onProgress: (snapshot: AttemptSnapshot) => void,
  onResult: (result: CollisionResult) => void,
  onError: (error: string) => void,
  onTheory: (theory: { bits: number; theoretical_50pct: number; expected_trials: number }) => void
): EventSource {
  const es = new EventSource(`${API_BASE}/simulations/${simulationId}/stream`);

  es.addEventListener('theory', ((e: MessageEvent) => {
    onTheory(JSON.parse(e.data));
  }) as EventListener);

  es.addEventListener('progress', ((e: MessageEvent) => {
    onProgress(JSON.parse(e.data));
  }) as EventListener);

  es.addEventListener('result', ((e: MessageEvent) => {
    onResult(JSON.parse(e.data));
    es.close();
  }) as EventListener);

  es.addEventListener('error', ((e: MessageEvent) => {
    if (e.data) {
      try {
        const err = JSON.parse(e.data);
        onError(err.error);
      } catch {
        onError('Stream error');
      }
    }
    es.close();
  }) as EventListener);

  es.addEventListener('stopped', ((e: MessageEvent) => {
    onError(JSON.parse(e.data).message);
    es.close();
  }) as EventListener);

  es.onerror = () => {
    onError('Connection lost');
    es.close();
  };

  return es;
}

// Comparison
export interface CompareRequest {
  message1: string;
  message2: string;
  bits: number;
}

export interface CompareResponse {
  message1: string;
  message2: string;
  full_digest1: string;
  full_digest2: string;
  truncated_value1: number;
  truncated_value2: number;
  truncated_hex1: string;
  truncated_hex2: string;
  bits: number;
  full_match: boolean;
  truncated_match: boolean;
  messages_identical: boolean;
  explanation: string;
}

export async function compareMessages(params: CompareRequest): Promise<CompareResponse> {
  return request('/compare', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// Theory
export interface TheoryResponse {
  bits: number;
  bound_50pct: number;
  expected_trials: number;
  bound_50pct_formula: string;
  expected_trials_formula: string;
  bound_50pct_reading: string;
  expected_trials_reading: string;
  worked_example: string;
}

export interface TheorySeriesResponse {
  bits: number[];
  bound_50pct: number[];
  expected_trials: number[];
  preimage_cost: number[];
  collision_cost_generic: number[];
}

export async function getTheory(bits: number): Promise<TheoryResponse> {
  return request(`/theory?bits=${bits}`);
}

export async function getTheorySeries(minBits: number, maxBits: number, step = 1): Promise<TheorySeriesResponse> {
  return request(`/theory/series?min_bits=${minBits}&max_bits=${maxBits}&step=${step}`);
}

// Batch experiments
export interface BatchExperimentRequest {
  bits: number;
  trials: number;
  seed?: number;
}

export interface BatchExperimentResponse {
  bits: number;
  trials_requested: number;
  trials_completed: number;
  attempts_list: number[];
  mean_attempts: number;
  median_attempts: number;
  min_attempts: number;
  max_attempts: number;
  theoretical_50pct: number;
  expected_trials: number;
}

export async function runBatchExperiment(params: BatchExperimentRequest): Promise<BatchExperimentResponse> {
  return request('/theory/batch', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// Health
export async function healthCheck(): Promise<{ status: string; service: string; version: string }> {
  return request('/health');
}