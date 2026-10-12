import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';

interface TheoryDataPoint {
  bits: number;
  bound_50pct: number;
  expected_trials: number;
  preimage_cost: number;
  collision_cost_generic: number;
}

interface TheoryChartProps {
  data: TheoryDataPoint[];
  selectedBits?: number;
  className?: string;
}

export function TheoryChart({ data, selectedBits, className = '' }: TheoryChartProps) {
  if (data.length === 0) {
    return (
      <div className={`h-72 ${className}`} role="img" aria-label="Loading theory chart">
        <div className="flex h-full items-center justify-center text-ink-500">Loading...</div>
      </div>
    );
  }

  const chartData = data.map(d => ({
    bits: d.bits,
    '50% Bound': d.bound_50pct,
    'Expected Trials': d.expected_trials,
    'Preimage (2ⁿ)': d.preimage_cost,
    'Collision (2ⁿᐟ²)': d.collision_cost_generic,
  }));

  return (
    <div className={`h-80 ${className}`} role="img" aria-label="Theory curves: collision cost vs digest size">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 50, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#243b53" />
          <XAxis
            type="number"
            dataKey="bits"
            tick={{ fill: '#829ab1', fontSize: 11 }}
            axisLine={{ stroke: '#243b53' }}
            tickLine={{ stroke: '#243b53' }}
            label={{ value: 'Digest Size (bits)', position: 'insideBottom', offset: -10, fill: '#829ab1', fontSize: 11 }}
            domain={['auto', 'auto']}
          />
          <YAxis
            type="number"
            scale="log"
            tick={{ fill: '#829ab1', fontSize: 11 }}
            axisLine={{ stroke: '#243b53' }}
            tickLine={{ stroke: '#243b53' }}
            tickFormatter={(value) => {
              if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
              if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
              if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
              if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
              return value.toString();
            }}
            label={{ value: 'Operations (log scale)', angle: -90, position: 'insideLeft', offset: 20, fill: '#829ab1', fontSize: 11 }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#102a43',
              border: '1px solid #243b53',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f0f4f8' }}
            formatter={(value: number, name: string) => [
              name.includes('Preimage') || name.includes('Collision')
                ? value.toLocaleString()
                : value.toFixed(1),
              name,
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => (
              <span style={{ color: '#f0f4f8', fontSize: 12 }}>{value}</span>
            )}
          />

          {/* Preimage cost - 2^n */}
          <Line
            type="monotone"
            dataKey="Preimage (2ⁿ)"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Preimage resistance: 2ⁿ"
            isAnimationActive={false}
          />

          {/* Collision cost - 2^(n/2) */}
          <Line
            type="monotone"
            dataKey="Collision (2ⁿᐟ²)"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Generic collision: 2ⁿᐟ²"
            isAnimationActive={false}
          />

          {/* 50% bound */}
          <motion.line animate={{ pathLength: 1 }} initial={{ pathLength: 0 }} transition={{ duration: 0.8 }}>
            <Line
              type="monotone"
              dataKey="50% Bound"
              stroke="#14b8a6"
              strokeWidth={2.5}
              dot={false}
              name="50% birthday bound"
              isAnimationActive={false}
            />
          </motion.line>

          {/* Expected trials */}
          <motion.line animate={{ pathLength: 1 }} initial={{ pathLength: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <Line
              type="monotone"
              dataKey="Expected Trials"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={false}
              name="Expected trials (√πN/2)"
              isAnimationActive={false}
            />
          </motion.line>

          {selectedBits && (
            <>
              <ReferenceLine
                x={selectedBits}
                stroke="#64748b"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <ReferenceLine
                y={data.find(d => d.bits === selectedBits)?.bound_50pct || 0}
                stroke="#64748b"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="flex items-center gap-1 text-red-400"><span className="w-4 h-0.5 bg-red-400" /> Preimage: 2ⁿ</span>
        <span className="flex items-center gap-1 text-amber-400"><span className="w-4 h-0.5 bg-amber-400" /> Generic collision: 2ⁿᐟ²</span>
        <span className="flex items-center gap-1 text-teal-400"><span className="w-4 h-0.5 bg-teal-400" /> 50% bound</span>
        <span className="flex items-center gap-1 text-violet-400"><span className="w-4 h-0.5 bg-violet-400" /> Expected trials</span>
      </div>

      {/* Data table for accessibility */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-ink-500 hover:text-ink-300">
          View data table (accessible alternative)
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs text-left" role="table">
            <thead>
              <tr className="border-b border-ink-700">
                <th className="pb-2 text-ink-400">Bits</th>
                <th className="pb-2 text-ink-400">50% Bound</th>
                <th className="pb-2 text-ink-400">Expected Trials</th>
                <th className="pb-2 text-ink-400">Preimage (2ⁿ)</th>
                <th className="pb-2 text-ink-400">Collision (2ⁿᐟ²)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.bits} className={`border-b border-ink-800/50 ${d.bits === selectedBits ? 'bg-teal-900/20' : ''}`}>
                  <td className="py-1 font-mono text-ink-300">{d.bits}</td>
                  <td className="py-1 font-mono text-teal-300">{d.bound_50pct.toFixed(1)}</td>
                  <td className="py-1 font-mono text-violet-300">{d.expected_trials.toFixed(1)}</td>
                  <td className="py-1 font-mono text-red-300">{d.preimage_cost.toLocaleString()}</td>
                  <td className="py-1 font-mono text-amber-300">{d.collision_cost_generic.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}