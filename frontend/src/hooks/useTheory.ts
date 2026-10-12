import { useState, useCallback } from 'react';
import { getTheory, getTheorySeries, runBatchExperiment } from '@/lib/api';
import type { TheoryResponse, TheorySeriesResponse, BatchExperimentResponse } from '@/lib/api';

export function useTheory() {
  const [theory, setTheory] = useState<TheoryResponse | null>(null);
  const [series, setSeries] = useState<TheorySeriesResponse | null>(null);
  const [batch, setBatch] = useState<BatchExperimentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTheory = useCallback(async (bits: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTheory(bits);
      setTheory(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch theory');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSeries = useCallback(async (minBits = 8, maxBits = 32, step = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTheorySeries(minBits, maxBits, step);
      setSeries(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch series');
    } finally {
      setLoading(false);
    }
  }, []);

  const runBatch = useCallback(async (bits: number, trials: number, seed?: number) => {
    setLoading(true);
    setError(null);
    setBatch(null);
    try {
      const res = await runBatchExperiment({ bits, trials, seed });
      setBatch(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch experiment failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    theory,
    series,
    batch,
    loading,
    error,
    fetchTheory,
    fetchSeries,
    runBatch,
  };
}