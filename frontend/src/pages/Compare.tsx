import { useState } from 'react';
import { useComparison } from '@/hooks/useComparison';
import { HashDisplay, Card, Section, Callout, Badge, CopyButton } from '@/components/Common';

export function Compare() {
  const { result, loading, error, compare, clear } = useComparison();
  const [message1, setMessage1] = useState('');
  const [message2, setMessage2] = useState('');
  const [bits, setBits] = useState(16);

  const handleCompare = () => {
    if (!message1.trim() || !message2.trim()) {
      return;
    }
    compare(message1, message2, bits);
  };

  const handleClear = () => {
    setMessage1('');
    setMessage2('');
    clear();
  };

  return (
    <div className="space-y-6">
      <Section title="Message Comparison" description="Compare two messages for full and truncated SHA-256 hash equality">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="label">Message 1 (UTF-8 encoded)</label>
                <textarea
                  value={message1}
                  onChange={(e) => setMessage1(e.target.value)}
                  rows={4}
                  className="input font-mono text-sm resize-y"
                  placeholder="Enter first message..."
                  aria-describedby="msg1-help"
                />
                <p id="msg1-help" className="text-xs text-ink-500">
                  Empty input, Unicode, whitespace, and very long messages are handled explicitly.
                </p>
              </div>
              <div>
                <label className="label">Message 2 (UTF-8 encoded)</label>
                <textarea
                  value={message2}
                  onChange={(e) => setMessage2(e.target.value)}
                  rows={4}
                  className="input font-mono text-sm resize-y"
                  placeholder="Enter second message..."
                  aria-describedby="msg2-help"
                />
                <p id="msg2-help" className="text-xs text-ink-500">
                  Messages are encoded as UTF-8 before hashing.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Truncation Bits</label>
                <select value={bits} onChange={(e) => setBits(Number(e.target.value))} className="input">
                  <option value={8}>8 bits</option>
                  <option value={12}>12 bits</option>
                  <option value={16}>16 bits</option>
                  <option value={20}>20 bits</option>
                  <option value={24}>24 bits</option>
                  <option value={32}>32 bits</option>
                </select>
              </div>
              <button
                onClick={handleCompare}
                disabled={loading || !message1.trim() || !message2.trim()}
                className="btn-primary w-full"
              >
                {loading ? 'Comparing...' : 'Compare'}
              </button>
              <button onClick={handleClear} className="btn-secondary w-full">
                Clear
              </button>
            </div>
          </div>
        </Card>
      </Section>

      {error && (
        <Callout type="danger" title="Error">
          <p className="text-ink-300">{error}</p>
        </Callout>
      )}

      {result && (
        <Section title="Comparison Results">
          <Card className="space-y-6">
            {/* Verdict Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge variant={result.messages_identical ? 'info' : result.full_match ? 'danger' : result.truncated_match ? 'warning' : 'success'}>
                {result.messages_identical ? 'Identical Messages' : result.full_match ? 'FULL SHA-256 COLLISION' : result.truncated_match ? 'Truncated Collision' : 'No Collision'}
              </Badge>
              <Badge variant={result.truncated_match ? 'warning' : 'default'}>
                Truncated: {result.truncated_match ? 'MATCH' : 'DIFFERENT'}
              </Badge>
              <Badge variant={result.full_match ? 'danger' : 'default'}>
                Full SHA-256: {result.full_match ? 'MATCH' : 'DIFFERENT'}
              </Badge>
            </div>

            {/* Explanation */}
            <Callout
              type={
                result.messages_identical ? 'info' :
                result.full_match ? 'danger' :
                result.truncated_match ? 'warning' : 'success'
              }
            >
              <p className="text-ink-300 whitespace-pre-wrap">{result.explanation}</p>
            </Callout>

            {/* Full SHA-256 Digests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h4 className="font-semibold text-ink-100 mb-2">Message 1</h4>
                <div className="mb-2 p-2 bg-ink-800 rounded font-mono text-xs break-all max-h-24 overflow-auto">
                  {message1}
                </div>
                <HashDisplay
                  fullDigest={result.full_digest1}
                  truncatedHex={result.truncated_hex1}
                  bits={bits}
                  label="Full SHA-256"
                />
                <CopyButton text={result.full_digest1} label="Copy Full Digest" />
              </Card>
              <Card>
                <h4 className="font-semibold text-ink-100 mb-2">Message 2</h4>
                <div className="mb-2 p-2 bg-ink-800 rounded font-mono text-xs break-all max-h-24 overflow-auto">
                  {message2}
                </div>
                <HashDisplay
                  fullDigest={result.full_digest2}
                  truncatedHex={result.truncated_hex2}
                  bits={bits}
                  label="Full SHA-256"
                />
                <CopyButton text={result.full_digest2} label="Copy Full Digest" />
              </Card>
            </div>

            {/* Truncated Comparison */}
            <Card>
              <h4 className="font-semibold text-ink-100 mb-3">Truncated Hash Comparison ({bits} bits)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-ink-500">Message 1</div>
                  <div className="font-mono text-lg text-teal-400">{result.truncated_hex1}</div>
                  <div className="text-xs text-ink-500">({result.truncated_value1})</div>
                </div>
                <div className="text-center flex items-center justify-center">
                  <span className={`font-bold text-2xl ${result.truncated_match ? 'text-amber-400' : 'text-red-400'}`}>
                    {result.truncated_match ? '=' : '≠'}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-xs text-ink-500">Message 2</div>
                  <div className="font-mono text-lg text-teal-400">{result.truncated_hex2}</div>
                  <div className="text-xs text-ink-500">({result.truncated_value2})</div>
                </div>
              </div>
            </Card>

            {/* Full SHA-256 Comparison */}
            <Card>
              <h4 className="font-semibold text-ink-100 mb-3">Full SHA-256 Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-ink-500">Message 1</div>
                  <div className="font-mono text-xs text-teal-400 break-all">{result.full_digest1}</div>
                </div>
                <div className="text-center flex items-center justify-center">
                  <span className={`font-bold text-2xl ${result.full_match ? 'text-red-400' : 'text-green-400'}`}>
                    {result.full_match ? '=' : '≠'}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-xs text-ink-500">Message 2</div>
                  <div className="font-mono text-xs text-teal-400 break-all">{result.full_digest2}</div>
                </div>
              </div>
            </Card>
          </Card>
        </Section>
      )}
    </div>
  );
}