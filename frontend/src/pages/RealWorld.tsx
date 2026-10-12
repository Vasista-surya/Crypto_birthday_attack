import { useState } from 'react';
import { realWorldCases, caseCategories } from '@/content/realWorldCases';
import { Card, Section, Callout, Badge } from '@/components/Common';
import { motion, AnimatePresence } from 'framer-motion';

export function RealWorld() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const filteredCases = selectedCategory === 'all'
    ? realWorldCases
    : realWorldCases.filter(c => {
        if (selectedCategory === 'block-cipher') return c.id === 'sweet32';
        if (selectedCategory === 'chosen-prefix') return c.id === 'md5-rogue-ca' || c.id === 'flame-malware' || c.id === 'sha1-shambles';
        if (selectedCategory === 'hash-collision') return c.id !== 'sweet32';
        return true;
      });

  return (
    <div className="space-y-8">
      <Section title="Real-World Incidents" description="Historical attacks where birthday-bound collisions broke real systems">
        <div className="flex flex-wrap gap-2 mb-6">
          {caseCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="popLayout">
          <div key={selectedCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((case_) => (
              <CaseCard key={case_.id} case_={case_} expanded={expandedCase === case_.id} onToggle={() => setExpandedCase(expandedCase === case_.id ? null : case_.id)} />
            ))}
          </div>
        </AnimatePresence>
      </Section>

      <Section title="Key Patterns Across Cases">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-semibold text-ink-100 mb-3">What These Attacks Have in Common</h3>
            <ul className="space-y-2 text-ink-300 list-disc list-inside">
              <li>Exploited the birthday bound (√N complexity)</li>
              <li>Targeted systems using deprecated/weak hash functions</li>
              <li>Required significant but achievable computational resources</li>
              <li>Attack cost decreased dramatically over time</li>
              <li>Legacy systems persisted long after weaknesses were known</li>
            </ul>
          </Card>
          <Card>
            <h3 className="font-semibold text-ink-100 mb-3">What Differentiates Them</h3>
            <ul className="space-y-2 text-ink-300 list-disc list-inside">
              <li>Identical-prefix (SHAttered) vs chosen-prefix (Rogue CA, Shambles)</li>
              <li>Hash function collisions (MD5, SHA-1) vs block cipher birthday (Sweet32)</li>
              <li>Offline precomputation vs online attack window</li>
              <li>Target: certificates, software updates, VPN traffic, PGP keys</li>
              <li>Cost: $657 (MD5 CA) → $75k (SHA-1 Shambles)</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Callout type="danger" title="⚠️ Important Distinction">
        <p className="text-ink-300">
          <strong>Sweet32 is NOT a hash collision.</strong> It is a birthday-bound attack on 64-bit <strong>block ciphers</strong> (3DES, Blowfish in CBC mode).
          The principle is identical (√N birthday bound), but the target is the cipher's block size, not a hash function's output.
          Our lab demonstrations only cover hash truncation collisions.
        </p>
      </Callout>
    </div>
  );
}

function CaseCard({ case_, expanded, onToggle }: { case_: typeof realWorldCases[0]; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className={`h-full transition-all ${expanded ? 'ring-2 ring-teal-500' : ''}`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info">{case_.year}</Badge>
              <Badge variant={case_.id === 'sweet32' ? 'info' : 'warning'}>{case_.category}</Badge>
            </div>
            <h3 className="font-semibold text-ink-100 text-lg">{case_.name}</h3>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-ink-800 text-ink-400 transition-colors"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>

        <div className="space-y-3 text-sm text-ink-300">
          <div>
            <span className="text-ink-500 font-medium">Weakness:</span> {case_.weakness}
          </div>
          <div>
            <span className="text-ink-500 font-medium">Impact:</span> {case_.impact}
          </div>
          <div>
            <span className="text-ink-500 font-medium">Lesson:</span> {case_.lesson}
          </div>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-ink-700 space-y-3"
          >
            <div className="text-xs text-ink-400">
              <span className="font-medium text-ink-300">Details:</span> {case_.details}
            </div>
            <div className="text-xs text-ink-400">
              <span className="font-medium text-ink-300">Source:</span> {case_.source}
            </div>
            <Callout type="danger" title="Differs from this lab because:">
              <p className="text-ink-300 text-sm">{case_.labDifference}</p>
            </Callout>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}