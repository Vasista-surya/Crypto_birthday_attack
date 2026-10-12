import { overviewContent } from '@/content/overview';
import { BirthdayParadox } from '@/components/BirthdayParadox';
import { MathFormula } from '@/components/MathFormula';
import { Section, Callout } from '@/components/Common';

export function Overview() {
  return (
    <div className="space-y-8">
      <Section
        title="Introduction"
        description={overviewContent.subtitle}
      >
        <p className="text-ink-300 leading-relaxed">{overviewContent.introduction}</p>
      </Section>

      <Section title="Interactive Birthday Paradox Analogy">
        <BirthdayParadox />
      </Section>

      {overviewContent.sections.map((section) => (
        <Section key={section.id} title={section.title}>
          {section.items ? (
            <ul className="space-y-3 list-disc list-inside text-ink-300">
              {section.items.map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
              ))}
            </ul>
          ) : (
            <div className="prose prose-invert max-w-none text-ink-300">{section.content}</div>
          )}

          {section.id === 'birthday-paradox' && (
            <MathFormula
              latex={section.id === 'birthday-paradox' 
                ? "P(\\text{collision}) \\approx 1 - e^{-k(k-1)/2N}"
                : "k_{50\\%} \\approx 1.1774 \\cdot 2^{n/2}"
              }
              reading={section.id === 'birthday-paradox'
                ? "The collision probability is approximately 1 minus e to the power of minus k squared over 2N, where N equals 2 to the n."
                : "The 50 percent threshold is approximately 1.1774 times 2 to the n over 2."
              }
              workedExample={section.id === 'birthday-paradox'
                ? "For 24-bit hash (N = 16,777,216):\nWith k = 4,096 hashes: P ≈ 1 - e^(-4096²/2×16,777,216) ≈ 39%\nWith k = 5,120 hashes: P ≈ 1 - e^(-5120²/2×16,777,216) ≈ 54%"
                : "For n = 16 bits:\nk_50% ≈ 1.1774 × 2^8 = 1.1774 × 256 ≈ 301 attempts"
              }
            />
          )}

          {section.id === 'complexity' && (
            <MathFormula
              latex="\\text{Collision cost} = 2^{n/2} \\quad \\text{vs} \\quad \\text{Preimage cost} = 2^n"
              reading="For an n-bit hash, collision resistance is the square root of the preimage resistance. This is why we say the effective security is half the digest length."
              workedExample="SHA-256 (n=256):\nPreimage: 2^256 operations (infeasible)\nCollision: 2^128 operations (infeasible)\n\nTruncated to 32 bits:\nPreimage: 2^32 = 4.3 billion (feasible)\nCollision: 2^16 = 65,536 (trivial)"
            />
          )}
        </Section>
      ))}

      <Callout type="danger" title="⚠️ Critical Disclaimer">
        <p className="text-ink-300">
          This laboratory demonstrates collisions <strong>only in deliberately truncated SHA-256 outputs</strong>.
          It never claims or implies that finding a collision in a truncated digest means full SHA-256 is broken or weakened.
          The distinction is visible in every result view throughout this lab.
        </p>
      </Callout>
    </div>
  );
}