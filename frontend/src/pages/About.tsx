import { Card, Section, Callout, Badge } from '@/components/Common';

export function About() {
  return (
    <div className="space-y-8">
      <Section title="About This Laboratory">
        <Card className="space-y-6">
          <div>
            <h3 className="font-semibold text-ink-100 mb-3">What This Lab Demonstrates</h3>
            <ul className="space-y-2 text-ink-300 list-disc list-inside">
              <li>The birthday paradox applied to cryptographic hash functions</li>
              <li>Collision search in deliberately <strong>truncated SHA-256</strong> outputs (8–32 bits)</li>
              <li>The generic birthday bound: collision resistance ≈ 2^(n/2) vs preimage resistance 2^n</li>
              <li>Why hash output size must be at least 2× the desired collision security level</li>
              <li>Real-world incidents where this principle broke systems (MD5, SHA-1, Sweet32)</li>
            </ul>
          </div>

          <Callout type="danger" title="⚠️ What This Lab Does NOT Demonstrate">
            <ul className="space-y-2 text-ink-300 list-disc list-inside">
              <li><strong>No collision in full SHA-256.</strong> All collisions are in truncated outputs only.</li>
              <li><strong>No cryptanalytic attack.</strong> This uses random search, not differential paths or chosen-prefix techniques.</li>
              <li><strong>No claim about SHA-256 weakness.</strong> SHA-256 remains secure for its intended use.</li>
              <li><strong>Results are probabilistic.</strong> Single runs vary; theory gives expectations, not guarantees.</li>
              <li><strong>Memory-bounded.</strong> Web version capped at 32 bits; notebook at 24 bits.</li>
            </ul>
          </Callout>

          <div>
            <h3 className="font-semibold text-ink-100 mb-3">Traceability: Notebook vs Report vs Proposed</h3>
            <table className="w-full text-left text-sm" role="table">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="pb-2 text-ink-400">Module</th>
                  <th className="pb-2 text-ink-400">Source</th>
                  <th className="pb-2 text-ink-400">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                <tr><td className="py-2">1. Overview</td><td className="py-2"><Badge variant="info">Report + Proposed</Badge></td><td className="py-2 text-ink-300">Birthday paradox interactive added</td></tr>
                <tr><td className="py-2">2. Collision Simulation</td><td className="py-2"><Badge variant="success">Notebook</Badge></td><td className="py-2 text-ink-300">SSE streaming, seed, highlighted truncation added</td></tr>
                <tr><td className="py-2">3. Message Comparison</td><td className="py-2"><Badge variant="success">Notebook</Badge></td><td className="py-2 text-ink-300">Full vs truncated verdicts, UTF-8 handling added</td></tr>
                <tr><td className="py-2">4. Theory vs Experiment</td><td className="py-2"><Badge variant="success">Notebook + Report</Badge></td><td className="py-2 text-ink-300">Two metrics separated, multi-run histogram proposed</td></tr>
                <tr><td className="py-2">5. Attack Walkthrough</td><td className="py-2"><Badge variant="info">Report + Proposed</Badge></td><td className="py-2 text-ink-300">Stepper animation, resistance comparison table</td></tr>
                <tr><td className="py-2">6. Real-World Cases</td><td className="py-2"><Badge variant="success">Report</Badge></td><td className="py-2 text-ink-300">5 cases with explicit lab-difference callouts</td></tr>
                <tr><td className="py-2">7. Security & Learning</td><td className="py-2"><Badge variant="success">Report</Badge></td><td className="py-2 text-ink-300">Algorithm table, countermeasures, quiz, faculty Q&A</td></tr>
                <tr><td className="py-2">8. About & Limitations</td><td className="py-2"><Badge variant="info">Proposed</Badge></td><td className="py-2 text-ink-300">This page</td></tr>
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      <Section title="Credits & References">
        <Card className="space-y-4">
          <div>
            <h3 className="font-semibold text-ink-100 mb-3">Source Materials</h3>
            <ul className="space-y-2 text-ink-300 list-disc list-inside">
              <li><strong>Report:</strong> "Birthday Attacks and Their Impact on Cryptographic Hashes" — 23CSE331 Cryptography Case Study (2026–27)</li>
              <li><strong>Notebook:</strong> <code>birthday_attack_step_by_step.ipynb</code> — Reference implementation with step-by-step output</li>
              <li><strong>Script:</strong> <code>birthday_attack.py</code> — CLI version of the same logic</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-ink-100 mb-3">Key References from Report</h3>
            <ul className="space-y-1 text-sm text-ink-300 list-disc list-inside">
              <li>Yuval, "How to Swindle Rabin," Cryptologia 1979</li>
              <li>Wang & Yu, "How to Break MD5," EUROCRYPT 2005</li>
              <li>Stevens et al., "Short Chosen-Prefix Collisions for MD5," CRYPTO 2009</li>
              <li>Stevens et al., "First Collision for Full SHA-1" (SHAttered), CRYPTO 2017</li>
              <li>Leurent & Peyrin, "SHA-1 is a Shambles," USENIX Security 2020</li>
              <li>Bhargavan & Leurent, "Sweet32," ACM CCS 2016</li>
              <li>Van Oorschot & Wiener, "Parallel Collision Search," J. Cryptology 1999</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-ink-100 mb-3">Standards & Resources</h3>
            <ul className="space-y-1 text-sm text-ink-300 list-disc list-inside">
              <li>NIST FIPS 180-4 (SHA-2), FIPS 202 (SHA-3)</li>
              <li>NIST SP 800-106 (Randomized Hashing)</li>
              <li>IETF RFC 6151 (MD5 Security Considerations)</li>
              <li>SHAttered: <a href="https://shattered.io" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">shattered.io</a></li>
              <li>SHA-1 Shambles: <a href="https://sha-mbles.github.io" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">sha-mbles.github.io</a></li>
              <li>Sweet32: <a href="https://www.sweet32.info/" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">sweet32.info</a></li>
            </ul>
          </div>
        </Card>
      </Section>

      <Section title="Repository & Deployment">
        <Card className="space-y-4">
          <div>
            <h3 className="font-semibold text-ink-100 mb-3">GitHub Repository</h3>
            <p className="text-ink-300">
              <a href="https://github.com/Vasista-surya/Crypto_birthday_attack" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                https://github.com/Vasista-surya/Crypto_birthday_attack
              </a>
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-ink-100 mb-3">Technology Stack</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Python 3.11+</Badge>
              <Badge variant="default">FastAPI</Badge>
              <Badge variant="default">Pydantic v2</Badge>
              <Badge variant="default">Uvicorn</Badge>
              <Badge variant="default">React 18</Badge>
              <Badge variant="default">TypeScript</Badge>
              <Badge variant="default">Vite</Badge>
              <Badge variant="default">Tailwind CSS</Badge>
              <Badge variant="default">Recharts</Badge>
              <Badge variant="default">KaTeX</Badge>
              <Badge variant="default">Docker</Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-ink-100 mb-3">License</h3>
            <p className="text-ink-300">Educational use — see LICENSE file for details.</p>
          </div>
        </Card>
      </Section>

      <Callout type="info" title="🎓 For Faculty Reviewers">
        <p className="text-ink-300">
          A suggested 8–10 minute demo walkthrough is available in <code>docs/DEMO_SCRIPT.md</code>.
          It covers recommended module order, bit sizes to demonstrate, and key talking points for each step.
        </p>
      </Callout>
    </div>
  );
}