import { useState, useEffect } from 'react';
import { useTheory } from '@/hooks/useTheory';
import { useSimulation } from '@/hooks/useSimulation';
import { TheoryChart } from '@/charts/TheoryChart';
import { HistogramChart } from '@/charts/HistogramChart';
import { MathFormula } from '@/components/MathFormula';
import { Card, Section, Callout, Badge } from '@/components/Common';

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    teal: 'text-teal-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    violet: 'text-violet-400',
    red: 'text-red-400',
    green: 'text-green-400',
  };
  return (
    <div className="bg-ink-800/50 rounded-lg p-3">
      <div className="text-xs text-ink-500 uppercase tracking-wide">{label}</div>
      <div className={`font-mono text-lg ${colors[color] || 'text-ink-300'}`}>{value}</div>
    </div>
  );
}

function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2' };
  return <div className={`${sizes[size]} border-ink-700 border-t-teal-500 rounded-full animate-spin`} aria-hidden="true" />;
}

export function Theory() {
  const { theory, series, batch, loading, fetchTheory, fetchSeries, runBatch } = useTheory();
  const { result } = useSimulation();
  const [selectedBits, setSelectedBits] = useState(16);
  const [batchBits, setBatchBits] = useState(16);
  const [batchTrials, setBatchTrials] = useState(20);

  useEffect(() => {
    fetchTheory(selectedBits);
    fetchSeries(8, 32, 1);
  }, [fetchTheory, fetchSeries, selectedBits]);

  const handleBatchRun = () => {
    runBatch(batchBits, batchTrials);
  };

  // Convert series to the format expected by TheoryChart (array of TheoryDataPoint)
  const chartData = series ? series.bits.map((bits, i) => ({
    bits,
    bound_50pct: series.bound_50pct[i],
    expected_trials: series.expected_trials[i],
    preimage_cost: series.preimage_cost[i],
    collision_cost_generic: series.collision_cost_generic[i],
  })) : [];

  // Convert batch attempts_list to histogram data
  const attemptCounts = batch?.attempts_list
    .reduce((acc: Record<number, number>, v: number) => {
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {}) ?? {};

  const histogramData = Object.entries(attemptCounts)
    .map(([key, count]) => ({ attempt: Number(key), count }))
    .sort((a, b) => a.attempt - b.attempt);

  return (
    <div className="space-y-8">
      <Section title="Theory vs Experiment" description="Compare theoretical predictions with actual simulation results">
        <Card className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink-400">Digest size:</span>
              <select
                value={selectedBits}
                onChange={(e) => setSelectedBits(Number(e.target.value))}
                className="input w-auto"
              >
                {[8, 12, 16, 20, 24, 28, 32].map((b) => (
                  <option key={b} value={b}>{b} bits</option>
                ))}
              </select>
            </label>
            {result && (
              <Badge variant="success">
                Last run: {result.attempts.toLocaleString()} attempts
              </Badge>
            )}
          </div>
        </Card>
      </Section>

      {theory && (
        <Section title={`Theoretical Metrics for ${selectedBits}-bit Hash`} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-ink-100 mb-3">50% Birthday Bound</h3>
              <MathFormula
                latex={theory.bound_50pct_formula}
                reading={theory.bound_50pct_reading}
                workedExample={theory.worked_example}
              />
              <div className="mt-4 p-3 bg-ink-800 rounded font-mono text-lg text-teal-400 text-center">
                {theory.bound_50pct.toLocaleString()} attempts
              </div>
            </Card>
            <Card>
              <h3 className="font-semibold text-ink-100 mb-3">Expected Trials</h3>
              <MathFormula
                latex={theory.expected_trials_formula}
                reading={theory.expected_trials_reading}
              />
              <div className="mt-4 p-3 bg-ink-800 rounded font-mono text-lg text-violet-400 text-center">
                {theory.expected_trials.toLocaleString()} attempts
              </div>
            </Card>
          </div>

          <Callout type="info" title="These Are Different Metrics">
            <p className="text-ink-300">
              <strong>50% Bound (≈1.177×2^(n/2)):</strong> Where collision probability reaches 50%.
              <br />
              <strong>Expected Trials (≈1.253×2^(n/2)):</strong> Mean of the distribution over many runs.
              <br />
              Do not confuse them — the expected value is higher because the distribution has a long tail.
            </p>
          </Callout>
        </Section>
      )}

      {result && (
        <Section title="Comparison with Last Simulation Run">
          <Card className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <StatBox label="Theoretical 50% Bound" value={theory?.bound_50pct.toFixed(1) ?? '—'} color="amber" />
              <StatBox label="Expected Trials" value={theory?.expected_trials.toFixed(1) ?? '—'} color="violet" />
              <StatBox label="Actual Attempts" value={result.attempts.toLocaleString()} color={result.collision_found ? 'teal' : 'red'} />
            </div>
            <div className="text-center text-sm text-ink-400">
              Difference from 50% bound: <strong className="text-teal-400">{(result.attempts - (theory?.bound_50pct ?? 0)).toFixed(1)}</strong> attempts
              <span className="mx-2">|</span>
              Difference from expected: <strong className="text-violet-400">{(result.attempts - (theory?.expected_trials ?? 0)).toFixed(1)}</strong> attempts
            </div>
          </Card>
        </Section>
      )}

      <Section title="Collision Search Effort vs Digest Length" description="Log-scale comparison of theoretical costs">
        <Card>
          <TheoryChart data={chartData || []} selectedBits={selectedBits} />
        </Card>
      </Section>

      <Section title="Multi-Run Experiment (Proposed Feature)">
        <Card className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="label">Bits (max 24 for batch)</label>
              <select value={batchBits} onChange={(e) => setBatchBits(Number(e.target.value))} className="input w-32" disabled={loading}>
                {[8, 10, 12, 14, 16, 18, 20, 22, 24].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Number of Trials</label>
              <select value={batchTrials} onChange={(e) => setBatchTrials(Number(e.target.value))} className="input w-32" disabled={loading}>
                {[5, 10, 20, 50, 100].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={handleBatchRun} disabled={loading} className="btn-primary">
              {loading ? <LoadingSpinner size="sm" /> : 'Run Batch Experiment'}
            </button>
          </div>

          {batch && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <StatBox label="Completed" value={batch.trials_completed} color="teal" />
                <StatBox label="Mean" value={batch.mean_attempts.toFixed(1)} color="blue" />
                <StatBox label="Median" value={batch.median_attempts} color="violet" />
                <StatBox label="Range" value={`${batch.min_attempts} – ${batch.max_attempts}`} color="amber" />
              </div>
              <HistogramChart
                data={histogramData}
                theoretical50pct={batch.theoretical_50pct}
                expectedTrials={batch.expected_trials}
                bits={batch.bits}
              />
              <Callout type="info" title="Why Do Results Vary?">
                <p className="text-ink-300">
                  The collision search is a random process. The theoretical values give expectations and probabilities, not guarantees.
                  Some runs collide early by chance; others take longer. The histogram shows this spread.
                  The mean approaches the expected-trials value, the median approaches the 50% bound, as the number of runs increases.
                </p>
              </Callout>
            </div>
          )}
        </Card>
      </Section>

      <Section title="Key Formulas Reference">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h4 className="font-semibold text-ink-100 mb-2">Collision Probability (Exact)</h4>
            <MathFormula
              latex="P = 1 - \prod_{i=1}^{k-1} \left(1 - \frac{i}{N}\right)"
              reading="The exact probability of at least one collision after k distinct hashes in a space of size N."
            />
          </Card>
          <Card>
            <h4 className="font-semibold text-ink-100 mb-2">Collision Probability (Approximation)</h4>
            <MathFormula
              latex="P \approx 1 - e^{-k(k-1)/2N}"
              reading="The standard approximation used in cryptography. Accurate when k is much smaller than N."
            />
          </Card>
          <Card>
            <h4 className="font-semibold text-ink-100 mb-2">Security Rule of Thumb</h4>
            <MathFormula
              latex="\text{digest bits} \ge 2 \times \text{collision security bits}"
              reading="To achieve b bits of collision resistance, use a hash with at least 2b bits of output."
              workedExample="128-bit collision security → 256-bit hash (SHA-256, SHA-3-256)\n80-bit collision security → 160-bit hash (SHA-1, now broken)"
            />
          </Card>
        </div>
      </Section>
    </div>
  );
}