import { useState, useCallback, useRef, useEffect } from 'react';
import { streamSimulation, startSimulation, stopSimulation } from '@/lib/api';
import type { AttemptSnapshot, CollisionResult } from '@/lib/api';

export function useSimulation() {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error' | 'stopped'>('idle');
  const [progress, setProgress] = useState<AttemptSnapshot | null>(null);
  const [result, setResult] = useState<CollisionResult | null>(null);
  const [theory, setTheory] = useState<{ bits: number; theoretical_50pct: number; expected_trials: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const start = useCallback(async (bits: number, seed?: number) => {
    // Clean up any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setStatus('running');
    setProgress(null);
    setResult(null);
    setError(null);

    try {
      const init = await startSimulation({ bits, seed });
      setTheory({ bits: init.bits, theoretical_50pct: init.theoretical_50pct, expected_trials: init.expected_trials });

      eventSourceRef.current = streamSimulation(
        init.simulation_id,
        (snapshot) => setProgress(snapshot),
        (collisionResult) => {
          setResult(collisionResult);
          setStatus(collisionResult.collision_found ? 'completed' : 'error');
          eventSourceRef.current = null;
        },
        (err) => {
          setError(err);
          setStatus('error');
          eventSourceRef.current = null;
        },
        (theoryData) => setTheory(theoryData)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start simulation');
      setStatus('error');
    }
  }, []);

  const stop = useCallback(async () => {
    if (result?.simulation_id) {
      await stopSimulation(result.simulation_id);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus('stopped');
  }, [result]);

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus('idle');
    setProgress(null);
    setResult(null);
    setTheory(null);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    status,
    progress,
    result,
    theory,
    error,
    start,
    stop,
    reset,
    isRunning: status === 'running',
  };
}