import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

interface ProgressDataPoint {
  attempt: number;
  uniqueHashes: number;
}

interface AttackProgressChartProps {
  data: ProgressDataPoint[];
  theoreticalBound: number;
  collisionAttempt?: number;
  bits: number;
  className?: string;
}

export function AttackProgressChart({
  data,
  theoreticalBound,
  collisionAttempt,
  bits,
  className = '',
}: AttackProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className={`h-64 ${className}`} role="img" aria-label="Waiting for simulation data">
        <div className="flex h-full items-center justify-center text-ink-500">
          <p>Start a simulation to see progress</p>
        </div>
      </div>
    );
  }

  const maxAttempts = Math.max(...data.map(d => d.attempt));
  const maxUnique = Math.max(...data.map(d => d.uniqueHashes));

  return (
    <div className={`h-72 ${className}`} role="img" aria-label={`Birthday attack progress for ${bits}-bit hash`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#243b53" vertical={false} />
          <XAxis
            type="number"
            dataKey="attempt"
            tick={{ fill: '#829ab1', fontSize: 11 }}
            axisLine={{ stroke: '#243b53' }}
            tickLine={{ stroke: '#243b53' }}
            label={{ value: 'Attempts', position: 'insideBottom', offset: -10, fill: '#829ab1', fontSize: 11 }}
            domain={[0, Math.max(maxAttempts, theoreticalBound * 1.5, (collisionAttempt || 0) * 1.2)]}
          />
          <YAxis
            type="number"
            dataKey="uniqueHashes"
            tick={{ fill: '#829ab1', fontSize: 11 }}
            axisLine={{ stroke: '#243b53' }}
            tickLine={{ stroke: '#243b53' }}
            label={{ value: 'Unique Hashes', angle: -90, position: 'insideLeft', offset: 10, fill: '#829ab1', fontSize: 11 }}
            domain={[0, Math.max(maxUnique, theoreticalBound * 1.1)]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#102a43',
              border: '1px solid #243b53',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f0f4f8' }}
            itemStyle={{ color: '#14b8a6' }}
            formatter={(value: number) => [value.toLocaleString(), 'Unique Hashes']}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => (
              <span style={{ color: '#f0f4f8', fontSize: 12 }}>{value}</span>
            )}
          />
          <motion.line
            animate={{ pathLength: 1 }}
            initial={{ pathLength: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Line
              type="monotone"
              dataKey="uniqueHashes"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#14b8a6' }}
              name="Unique hashes observed"
              isAnimationActive={false}
            />
          </motion.line>

          <ReferenceLine
            x={theoreticalBound}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `50% bound ≈ ${theoreticalBound.toFixed(1)}`,
              position: 'top',
              fill: '#f59e0b',
              fontSize: 11,
            }}
          />

          {collisionAttempt && (
            <ReferenceLine
              x={collisionAttempt}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: `Collision at ${collisionAttempt}`,
                position: 'bottom',
                fill: '#ef4444',
                fontSize: 11,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Data table for accessibility */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-ink-500 hover:text-ink-300">
          View data table (accessible alternative)
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs text-left" role="table">
            <thead>
              <tr className="border-b border-ink-700">
                <th className="pb-2 text-ink-400">Attempt</th>
                <th className="pb-2 text-ink-400">Unique Hashes</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-20).map((d) => (
                <tr key={d.attempt} className="border-b border-ink-800/50">
                  <td className="py-1 font-mono text-ink-300">{d.attempt}</td>
                  <td className="py-1 font-mono text-teal-300">{d.uniqueHashes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}