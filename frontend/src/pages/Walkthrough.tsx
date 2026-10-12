import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Section, Callout } from '@/components/Common';
import { MathFormula } from '@/components/MathFormula';

const steps = [
  {
    id: 1,
    title: "Generate Distinct Inputs",
    description: "Create two different messages. In a real attack, these might be a legitimate contract and a fraudulent one, or two certificate requests with different subjects.",
    detail: "The attacker controls both messages and can make many variants (adding spaces, invisible characters, reordering PDF objects, etc.)",
    formula: null,
  },
  {
    id: 2,
    title: "Compute Full Hashes",
    description: "Calculate SHA-256 for each message. This produces two 256-bit (64 hex character) digests.",
    detail: "At this stage, the full digests are almost certainly different. SHA-256 has 2^256 possible outputs.",
    formula: "H(m) = \\text{SHA-256}(m) \\in \\{0,1\\}^{256}",
  },
  {
    id: 3,
    title: "Truncate to n Bits",
    description: "Keep only the first n bits of each 256-bit digest. This is the reduced hash space.",
    detail: "Truncation: truncated = H(m) >> (256 - n). For n=16, we keep the first 16 bits (4 hex chars). The remaining 240 bits are discarded.",
    formula: "T_n(m) = \\text{MSB}_n(\\text{SHA-256}(m))",
  },
  {
    id: 4,
    title: "Compare Truncated Values",
    description: "Check if the two n-bit truncated values are equal.",
    detail: "In the reduced space of 2^n possible values, the birthday paradox says a collision is likely after ~2^(n/2) attempts.",
    formula: "T_n(m_1) \\stackrel{?}{=} T_n(m_2)",
  },
  {
    id: 5,
    title: "Collision Detected",
    description: "If T_n(m₁) = T_n(m₂) and m₁ ≠ m₂, we have a collision in the truncated hash.",
    detail: "CRITICAL: The full SHA-256 digests H(m₁) and H(m₂) are STILL DIFFERENT. The collision exists ONLY in the truncated output.",
    formula: "H(m_1) \\neq H(m_2) \\quad \\text{but} \\quad T_n(m_1) = T_n(m_2)",
  },
  {
    id: 6,
    title: "Why This Matters",
    description: "Many systems mistakenly use truncated hashes or short digests. This demonstrates why the collision security is ~2^(n/2), not 2^n.",
    detail: "Real attacks (MD5, SHA-1) use sophisticated cryptanalysis to find collisions in the FULL hash. This lab only shows the generic birthday bound on a deliberately weakened version.",
    formula: null,
  },
];

const resistanceComparison = [
  {
    property: "Preimage Resistance",
    definition: "Given y, find m such that H(m) = y",
    attackerGoal: "Recover input from hash output",
    genericCost: "2^n",
    example: "Password hash reversal (if no salt)",
  },
  {
    property: "Second-Preimage Resistance",
    definition: "Given m₁, find m₂ ≠ m₁ such that H(m₂) = H(m₁)",
    attackerGoal: "Find different input with same hash as known input",
    genericCost: "2^n",
    example: "Modify a signed document without changing its hash",
  },
  {
    property: "Collision Resistance",
    definition: "Find any m₁ ≠ m₂ such that H(m₁) = H(m₂)",
    attackerGoal: "Find any two inputs with same hash",
    genericCost: "2^(n/2)",
    example: "Create two certificates with same hash (MD5 rogue CA)",
  },
];

export function Walkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [singleStepMode, setSingleStepMode] = useState(false);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="space-y-8">
      <Section title="Attack Process Walkthrough" description="Step-by-step animation of the birthday collision attack">
        <Card className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  i === currentStep
                    ? 'bg-teal-600 text-white'
                    : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
                }`}
              >
                Step {i + 1}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl">
                  {currentStep + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink-100">{steps[currentStep].title}</h3>
                  <p className="text-ink-300">{steps[currentStep].description}</p>
                </div>
              </div>

              <Callout type="info">
                <p className="text-ink-300">{steps[currentStep].detail}</p>
              </Callout>

              {steps[currentStep].formula && (
                <MathFormula
                  latex={steps[currentStep].formula!}
                  reading={`Step ${currentStep + 1} formula`}
                />
              )}

              <div className="flex justify-center gap-4 pt-4">
                <button onClick={goPrev} disabled={currentStep === 0} className="btn-secondary">
                  Previous
                </button>
                <button onClick={goNext} disabled={currentStep === steps.length - 1} className="btn-primary">
                  Next
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {singleStepMode && currentStep < steps.length - 1 && (
            <div className="text-center text-sm text-ink-500">
              Single-step mode: Click "Next" to advance one step at a time
            </div>
          )}
        </Card>
      </Section>

      <Section title="Single-Step Mode (Small Digest Sizes)">
        <Card>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={singleStepMode}
              onChange={(e) => setSingleStepMode(e.target.checked)}
              className="w-4 h-4 accent-teal-500"
            />
            <span className="text-ink-300">Enable single-step mode (forces small digest size for visibility)</span>
          </label>
          {singleStepMode && (
            <p className="mt-2 text-sm text-ink-500">
              With single-step mode, use the Simulation page with 8-12 bits to see each attempt clearly.
            </p>
          )}
        </Card>
      </Section>

      <Section title="Resistance Comparison: Preimage vs Second-Preimage vs Collision">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="pb-3 text-ink-400">Property</th>
                  <th className="pb-3 text-ink-400">Definition</th>
                  <th className="pb-3 text-ink-400">Attacker Goal</th>
                  <th className="pb-3 text-ink-400">Generic Cost</th>
                  <th className="pb-3 text-ink-400">Example</th>
                </tr>
              </thead>
              <tbody>
                {resistanceComparison.map((row, i) => (
                  <tr key={i} className="border-b border-ink-800/50">
                    <td className="py-3 font-semibold text-ink-100">{row.property}</td>
                    <td className="py-3 text-ink-300 font-mono text-sm">{row.definition}</td>
                    <td className="py-3 text-ink-300">{row.attackerGoal}</td>
                    <td className="py-3 font-mono text-lg text-teal-400">{row.genericCost}</td>
                    <td className="py-3 text-ink-300">{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout type="warning" title="Key Insight">
            <p className="text-ink-300">
              <strong>Collision resistance is the weakest property.</strong> Its generic cost is 2^(n/2), half the exponent of preimage/second-preimage.
              This is why hash output size is determined by collision resistance requirements.
              For 128-bit collision security, you need a 256-bit hash (SHA-256, SHA-3-256).
            </p>
          </Callout>

          <MathFormula
            latex="\\text{Preimage: } 2^n \\quad \\text{Second-preimage: } 2^n \\quad \\text{Collision: } 2^{n/2}"
            reading="Preimage and second-preimage resistance both cost 2^n operations. Collision resistance costs only 2^(n/2) due to the birthday paradox."
            workedExample="SHA-256 (n=256):\nPreimage: 2^256 (infeasible)\nSecond-preimage: 2^256 (infeasible)\nCollision: 2^128 (infeasible, but much less than 2^256)\n\nTruncated to 32 bits:\nPreimage: 2^32 (feasible)\nCollision: 2^16 (trivial)"
          />
        </Card>
      </Section>

      <Section title="Visual Summary">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <ResistanceCard
              title="Preimage"
              cost="2^n"
              color="red"
              description="Given hash, find input"
            />
            <ResistanceCard
              title="Second-Preimage"
              cost="2^n"
              color="red"
              description="Given input, find different input with same hash"
            />
            <ResistanceCard
              title="Collision"
              cost="2^(n/2)"
              color="teal"
              description="Find ANY two inputs with same hash (birthday bound)"
            />
          </div>
        </Card>
      </Section>
    </div>
  );
}

function ResistanceCard({ title, cost, color, description }: { title: string; cost: string; color: string; description: string }) {
  const colors = {
    red: 'text-red-400 bg-red-900/20 border-red-800',
    teal: 'text-teal-400 bg-teal-900/20 border-teal-800',
  };
  return (
    <div className={`border rounded-xl p-6 ${colors[color as keyof typeof colors]}`}>
      <h4 className="font-semibold text-ink-100 mb-2">{title}</h4>
      <div className="font-mono text-2xl mb-2">{cost}</div>
      <p className="text-sm text-ink-400">{description}</p>
    </div>
  );
}