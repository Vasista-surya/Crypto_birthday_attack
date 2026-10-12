import { useState, useCallback } from 'react';
import { compareMessages } from '@/lib/api';
import type { CompareResponse } from '@/lib/api';

export function useComparison() {
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compare = useCallback(async (message1: string, message2: string, bits: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await compareMessages({ message1, message2, bits });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, compare, clear };
}