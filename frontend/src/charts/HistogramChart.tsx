import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

interface HistogramDataPoint {
  attempt: number;
  count: number;
}

interface HistogramChartProps {
  data: HistogramDataPoint[];
  theoretical50pct: number;
  expectedTrials: number;
  bits: number;
  className?: string;
}

export function HistogramChart({
  data,
  theoretical50pct,
  expectedTrials,
  bits,
  className = '',
}: HistogramChartProps) {
  if (data.length === 0) {
    return (
      <div className={`h-72 ${className}`} role="img" aria-label="No batch experiment data">
        <div className="flex h-full items-center justify-center text-ink-500">Run a batch experiment to see distribution</div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const maxAttempt = Math.max(...data.map(d => d.attempt));

  return (
    <div className={`h-80 ${className}`} role="img" aria-label={`Collision attempts distribution for ${bits}-bit hash`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#243b53" vertical={false} />
          <XAxis
            type="number"
            dataKey="attempt"
            tick={{ fill: '#829ab1', fontSize: 11 }}
            axisLine={{ stroke: '#243b53' }}
            tickLine={{ stroke: '#243b53' }}
            label={{ value: 'Attempts until collision', position: 'insideBottom', offset: -10, fill: '#829ab1', fontSize: 11 }}
            domain={[0, Math.max(maxAttempt, theoretical50pct * 1.5, expectedTrials * 1.5)]}
          />
          <YAxis
            type="number"
            dataKey="count"
            tick={{ fill: '#829ab1', fontSize: 11 }}
            axisLine={{ stroke: '#243b53' }}
            tickLine={{ stroke: '#243b53' }}
            label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 10, fill: '#829ab1', fontSize: 11 }}
            domain={[0, maxCount * 1.3]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#102a43',
              border: '1px solid #243b53',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f0f4f8' }}
            formatter={(value: number) => [value, 'Runs']}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => <span style={{ color: '#f0f4f8', fontSize: 12 }}>{value}</span>}
          />
          <Bar
            dataKey="count"
            fill="#14b8a6"
            radius={[4, 4, 0, 0]}
            name="Frequency"
            maxBarSize={30}
          />

          <ReferenceLine
            x={theoretical50pct}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `50% bound ≈ ${theoretical50pct.toFixed(1)}`,
              position: 'top',
              fill: '#f59e0b',
              fontSize: 11,
            }}
          />
          <ReferenceLine
            x={expectedTrials}
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `Expected ≈ ${expectedTrials.toFixed(1)}`,
              position: 'top',
              fill: '#8b5cf6',
              fontSize: 11,
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <StatBox label="Mean" value={data.reduce((sum, d) => sum + d.attempt * d.count, 0) / data.reduce((sum, d) => sum + d.count, 0)} />
        <StatBox label="Median" value={getMedian(data)} />
        <StatBox label="Min" value={data[0]?.attempt ?? 0} />
        <StatBox label="Max" value={data[data.length - 1]?.attempt ?? 0} />
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
                <th className="pb-2 text-ink-400">Attempts</th>
                <th className="pb-2 text-ink-400">Frequency</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.attempt} className="border-b border-ink-800/50">
                  <td className="py-1 font-mono text-ink-300">{d.attempt}</td>
                  <td className="py-1 font-mono text-teal-300">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-ink-900/50 border border-ink-700 rounded-lg p-3">
      <div className="text-ink-500 text-xs uppercase tracking-wide">{label}</div>
      <div className="font-mono text-lg text-teal-300">{typeof value === 'number' ? value.toFixed(1) : value}</div>
    </div>
  );
}

function getMedian(data: HistogramDataPoint[]): number {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  let half = total / 2;
  let cumulative = 0;
  for (const d of data) {
    cumulative += d.count;
    if (cumulative >= half) return d.attempt;
  }
  return data[data.length - 1]?.attempt ?? 0;
}