import { useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { useTheory } from '@/hooks/useTheory';
import { AttackProgressChart } from '@/charts/AttackProgressChart';
import { MathFormula } from '@/components/MathFormula';
import { Card, Section, Callout, HashDisplay, CopyButton, Toast } from '@/components/Common';
import { motion } from 'framer-motion';

export function Simulation() {
  const { status, progress, result, theory, error, start, stop, reset, isRunning } = useSimulation();
  const { fetchTheory } = useTheory();
  const [bits, setBits] = useState(16);
  const [seed, setSeed] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStart = () => {
    const seedNum = seed ? parseInt(seed, 10) : undefined;
    if (seed && isNaN(seedNum!)) {
      showToast('Seed must be a number', 'error');
      return;
    }
    start(bits, seedNum);
    fetchTheory(bits);
  };

  const handleStop = async () => {
    await stop();
    showToast('Simulation stopped', 'info');
  };

  const handleReset = () => {
    reset();
    showToast('Simulation reset', 'info');
  };

  const bitOptions = [8, 12, 16, 20, 24, 28, 32];

  return (
    <div className="space-y-6">
      <Section title="Interactive Collision Search" description="Generate random messages and search for a truncated SHA-256 collision">
        <Card className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Digest Size (bits)</label>
              <select
                value={bits}
                onChange={(e) => setBits(Number(e.target.value))}
                disabled={isRunning}
                className="input"
              >
                {bitOptions.map((b) => (
                  <option key={b} value={b}>
                    {b} bits {b <= 16 ? '— Fast' : b <= 24 ? '— Moderate' : '— Slow'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-500">
                {bits > 24 ? '⚠️ High memory usage' : bits > 16 ? 'ℹ️ May take longer' : '✓ Recommended for demo'}
              </p>
            </div>
            <div>
              <label className="label">Seed (optional)</label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="e.g., 42 for reproducible run"
                className="input"
                disabled={isRunning}
              />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={handleStart} disabled={isRunning} className="btn-primary flex-1">
                {isRunning ? 'Running...' : 'Start Search'}
              </button>
              <button onClick={handleStop} disabled={!isRunning} className="btn-danger">
                Stop
              </button>
              <button onClick={handleReset} className="btn-secondary">
                Reset
              </button>
            </div>
          </div>

          {bits > 24 && (
            <Callout type="warning" title="Memory Warning">
              At {bits} bits, the expected collision needs ~{Math.round(2 ** (bits / 2)).toLocaleString()} stored hashes.
              This may consume significant memory and time.
            </Callout>
          )}

          <Callout type="danger" title="⚠️ Collision in Truncated Output Only">
            <p className="text-ink-300">
              Any collision found is in the <strong>{bits}-bit truncated SHA-256 output only</strong>.
              The full 256-bit SHA-256 digests of the colliding messages are completely different.
              This demonstrates the birthday paradox principle — it does NOT break SHA-256.
            </p>
          </Callout>
        </Card>
      </Section>

      {theory && (
        <Section title="Theoretical Metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="font-semibold text-ink-100 mb-3">50% Birthday Bound</h3>
              <MathFormula
                latex={`k_{50\\%} = \\sqrt{2 \\cdot 2^{${bits}} \\ln 2} \\approx ${theory.theoretical_50pct.toFixed(2)}`}
                reading={`The number of attempts for approximately 50% probability of at least one collision. For ${bits} bits, this is ${theory.theoretical_50pct.toFixed(2)} attempts.`}
              />
            </Card>
            <Card>
              <h3 className="font-semibold text-ink-100 mb-3">Expected Trials</h3>
              <MathFormula
                latex={`E[k] = \\sqrt{\\frac{\\pi \\cdot 2^{${bits}}}{2}} \\approx ${theory.expected_trials.toFixed(2)}`}
                reading={`The average number of trials until the first collision over many runs. For ${bits} bits, this is ${theory.expected_trials.toFixed(2)} attempts.`}
              />
            </Card>
          </div>
        </Section>
      )}

      {status === 'running' && progress && (
        <Section title="Live Progress">
          <Card className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <StatCard label="Attempts" value={progress.attempt.toLocaleString()} color="teal" />
              <StatCard label="Unique Hashes" value={progress.unique_hashes_count.toLocaleString()} color="blue" />
              <StatCard label="Elapsed" value={`${progress.elapsed_seconds.toFixed(2)}s`} color="amber" />
              <StatCard label="Rate" value={`${progress.attempts_per_second.toFixed(0)}/s`} color="violet" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-400">Latest Message</span>
                <span className="font-mono text-ink-300">{progress.message}</span>
              </div>
              <HashDisplay
                fullDigest={progress.full_digest}
                truncatedHex={progress.truncated_hex}
                bits={bits}
                label="Latest Full SHA-256 (truncated portion highlighted)"
              />
              <div className="text-xs text-ink-500 font-mono">
                Binary: {progress.truncated_binary}
              </div>
            </div>
          </Card>
        </Section>
      )}

      {result && (
        <Section title={result.collision_found ? 'Collision Found!' : 'Search Completed'}>
          <Card className="space-y-4">
            {result.collision_found ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-amber-900/20 border border-amber-800 rounded-lg p-4 animate-pulse"
                >
                  <div className="flex items-center gap-2 text-amber-300">
                    <span className="text-2xl">🎉</span>
                    <h3 className="text-lg font-semibold">COLLISION FOUND at {result.attempts.toLocaleString()} attempts!</h3>
                  </div>
                  <p className="mt-1 text-amber-200">
                    Theoretical 50% bound: {result.theoretical_50pct.toFixed(2)} | Expected trials: {result.expected_trials.toFixed(2)}
                  </p>
                </motion.div>

                <Callout type="danger" title="⚠️ Critical Distinction">
                  <p className="text-ink-300">
                    <strong>Full SHA-256 digests are DIFFERENT.</strong> The collision exists only in the {bits}-bit truncated output.
                    This is the birthday paradox on a reduced hash space — it does NOT mean SHA-256 is broken.
                  </p>
                </Callout>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <h4 className="font-semibold text-ink-100 mb-2">Message 1</h4>
                    <HashDisplay
                      fullDigest={result.full_digest1}
                      truncatedHex={result.truncated_hex}
                      bits={bits}
                    />
                    <div className="mt-2 p-2 bg-ink-800 rounded font-mono text-xs break-all">
                      {result.message1}
                    </div>
                    <CopyButton text={result.message1} label="Copy Message 1" />
                  </Card>
                  <Card>
                    <h4 className="font-semibold text-ink-100 mb-2">Message 2</h4>
                    <HashDisplay
                      fullDigest={result.full_digest2}
                      truncatedHex={result.truncated_hex}
                      bits={bits}
                    />
                    <div className="mt-2 p-2 bg-ink-800 rounded font-mono text-xs break-all">
                      {result.message2}
                    </div>
                    <CopyButton text={result.message2} label="Copy Message 2" />
                  </Card>
                </div>

                <Card>
                  <h4 className="font-semibold text-ink-100 mb-2">Common Truncated Hash</h4>
                  <div className="flex items-center gap-4 font-mono text-lg text-amber-400">
                    <span>{result.truncated_hex}</span>
                    <span className="text-ink-500">({bits} bits = {result.truncated_value} decimal)</span>
                  </div>
                  <div className="mt-2 text-xs text-ink-500">
                    Binary: {result.truncated_value.toString(2).padStart(bits, '0')}
                  </div>
                </Card>
              </>
            ) : (
              <Callout type="warning" title="No Collision Found">
                <p className="text-ink-300">
                  Search completed {result.stopped_early ? '(memory limit reached)' : '(max attempts reached)'} after {result.attempts.toLocaleString()} attempts.
                  Try a smaller bit size or increase max attempts.
                </p>
              </Callout>
            )}

            <AttackProgressChart
              data={result.attempts_history.map((a, i) => ({
                attempt: a,
                uniqueHashes: result.unique_hashes_history[i]
              }))}
              theoreticalBound={result.theoretical_50pct}
              collisionAttempt={result.collision_found ? result.attempts : undefined}
              bits={bits}
            />
          </Card>
        </Section>
      )}

      {error && (
        <Toast message={error} type="error" onClose={() => {}} />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = {
    teal: 'text-teal-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    violet: 'text-violet-400',
  };
  return (
    <div className="bg-ink-800/50 rounded-lg p-4">
      <div className="text-xs text-ink-500 uppercase tracking-wide">{label}</div>
      <div className={`font-mono text-2xl ${colors[color as keyof typeof colors]}`}>{value}</div>
    </div>
  );
}