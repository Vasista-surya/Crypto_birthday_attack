import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  latex: string;
  reading: string;
  workedExample?: string;
  displayMode?: boolean;
}

export function MathFormula({ latex, reading, workedExample, displayMode = true }: MathFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(latex, containerRef.current, {
          displayMode,
          throwOnError: false,
          strict: false,
        });
      } catch (e) {
        console.warn('KaTeX render error:', e);
      }
    }
  }, [latex, displayMode]);

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="math-formula" aria-label={`Mathematical formula: ${reading}`} />
      <details className="group">
        <summary className="cursor-pointer text-sm text-ink-400 hover:text-ink-200 flex items-center gap-1">
          <span>📖</span> In words (click to expand)
          <span className="ml-auto transition-transform group-open:rotate-90">▸</span>
        </summary>
        <div className="mt-2 p-3 bg-ink-800/50 rounded-lg text-ink-300 text-sm leading-relaxed">
          <p>{reading}</p>
          {workedExample && (
            <div className="mt-3 p-3 bg-ink-900 rounded border border-ink-700 font-mono text-xs overflow-x-auto">
              <strong className="text-ink-200">Worked Example:</strong>
              <pre className="mt-2 whitespace-pre-wrap">{workedExample}</pre>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}

interface InlineMathProps {
  latex: string;
}

export function InlineMath({ latex }: InlineMathProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, { throwOnError: false, strict: false });
    }
  }, [latex]);
  return <span ref={ref} className="inline-math" aria-hidden="true" />;
}