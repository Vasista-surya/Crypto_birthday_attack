import { useState, useMemo } from 'react';
import { MathFormula } from './MathFormula';

export function BirthdayParadox() {
  const [days, setDays] = useState(365);
  const [people, setPeople] = useState(23);

  const probability = useMemo(() => {
    if (people > days) return 1;
    if (people <= 1) return 0;
    let prob = 1;
    for (let i = 1; i < people; i++) {
      prob *= (days - i) / days;
    }
    return 1 - prob;
  }, [days, people]);

  const fiftyPercentPeople = useMemo(() => {
    return Math.ceil(Math.sqrt(2 * days * Math.log(2)));
  }, [days]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-ink-100">Interactive Birthday Paradox</h3>
          <p className="text-ink-400 text-sm">
            Adjust the sliders to see how the collision probability changes.
            This is an <strong>analogy</strong> — hash digests behave like birthdays in a finite space.
          </p>

          <div className="space-y-4">
            <div>
              <label className="label">Days in year (hash space size N = 2ⁿ)</label>
              <input
                type="range"
                min="10"
                max="1000"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full h-2 bg-ink-800 rounded-lg appearance-none accent-teal-500"
                aria-label="Days in year"
              />
              <div className="flex justify-between text-sm text-ink-500 mt-1">
                <span>10</span>
                <span className="font-mono text-ink-300">{days}</span>
                <span>1000</span>
              </div>
            </div>

            <div>
              <label className="label">Group size (number of hashes k)</label>
              <input
                type="range"
                min="1"
                max={Math.min(200, days)}
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                className="w-full h-2 bg-ink-800 rounded-lg appearance-none accent-teal-500"
                aria-label="Group size"
              />
              <div className="flex justify-between text-sm text-ink-500 mt-1">
                <span>1</span>
                <span className="font-mono text-ink-300">{people}</span>
                <span>{Math.min(200, days)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-ink-100">Probability Result</h3>
          <div className="text-center py-8">
            <div className="text-5xl font-bold font-mono text-teal-400">
              {(probability * 100).toFixed(2)}%
            </div>
            <div className="mt-2 text-ink-400">
              Chance of at least one shared birthday
            </div>
            <div className="mt-4 h-4 bg-ink-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all duration-500"
                style={{ width: `${probability * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-ink-800/50 rounded-lg p-3">
              <div className="font-mono text-lg text-amber-400">{fiftyPercentPeople}</div>
              <div className="text-xs text-ink-500">People for 50% chance</div>
            </div>
            <div className="bg-ink-800/50 rounded-lg p-3">
              <div className="font-mono text-lg text-teal-300">{days}</div>
              <div className="text-xs text-ink-500">Total days (N)</div>
            </div>
          </div>
        </div>
      </div>

      <MathFormula
        latex={probability > 0
          ? `P(\\text{collision}) = 1 - \\prod_{i=1}^{k-1} \\left(1 - \\frac{i}{N}\\right) \\approx 1 - e^{-k(k-1)/2N}`
          : `P(\\text{collision}) = 1 - \\prod_{i=1}^{k-1} \\left(1 - \\frac{i}{N}\\right)`
        }
        reading={
          `With ${days} possible "birthdays" (hash outputs) and ${people} "people" (hashes computed), ` +
          `the probability of at least one collision is ${(probability * 100).toFixed(2)}%. ` +
          `The formula computes 1 minus the probability that all ${people} hashes are different.`
        }
        workedExample={
          `Example: N = ${days}, k = ${people}\n` +
          `P(no collision) = (1 - 1/${days}) × (1 - 2/${days}) × ... × (1 - ${people - 1}/${days})\n` +
          `P(collision) = 1 - P(no collision) = ${(probability * 100).toFixed(2)}%`
        }
      />

      <div className="card">
        <h3 className="font-semibold text-ink-100 mb-3">Key Insight</h3>
        <p className="text-ink-300">
          The number of <strong>pairs</strong> among ${people} items is ${people}×${people - 1}/2 = ${(people * (people - 1) / 2).toLocaleString()}.
          This quadratic growth in pairs is why the collision probability scales with the square root of the space size
          (<span className="font-mono text-teal-400">√N ≈ ${Math.sqrt(days).toFixed(0)}</span>), not linearly with N.
        </p>
      </div>
    </div>
  );
}