import { useState } from 'react';
import { algorithmComparison, countermeasures, lessonsLearned, knowledgeChecks, facultyQA } from '@/content/security';
import { Card, Section, Callout, Badge } from '@/components/Common';
import { motion, AnimatePresence } from 'framer-motion';
import type { KnowledgeCheckQuestion } from '@/content/knowledgeChecks';
import type { FacultyQAItem } from '@/content/facultyQA';

export function Security() {
  const [qaIndex, setQaIndex] = useState(0);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  const handleQuizSubmit = () => {
    let score = 0;
    knowledgeChecks.forEach((q, i) => {
      const expectedAnswer = q.type === 'true-false'
        ? (q.correct ? 'true' : 'false')
        : (q.options?.find((o: { id: string; correct?: boolean }) => o.correct)?.id ?? '');
      if (quizAnswers[i] === expectedAnswer) {
        score++;
      }
    });
    setQuizScore(score);
  };

  const handleQuizReset = () => {
    setQuizAnswers({});
    setQuizScore(null);
  };

  return (
    <div className="space-y-8">
      <Section title="Algorithm Comparison">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="pb-3 text-ink-400">Algorithm</th>
                  <th className="pb-3 text-ink-400">Digest Size</th>
                  <th className="pb-3 text-ink-400">Collision Status</th>
                  <th className="pb-3 text-ink-400">Recommended Use</th>
                </tr>
              </thead>
              <tbody>
                {algorithmComparison.map((algo, i) => (
                  <tr key={i} className="border-b border-ink-800/50">
                    <td className="py-3 font-semibold text-ink-100">{algo.name}</td>
                    <td className="py-3 font-mono text-teal-400">{algo.digestSize} bits</td>
                    <td className="py-3">
                      <Badge variant={algo.status === 'Broken' ? 'danger' : 'success'}>{algo.status}</Badge>
                      <div className="mt-1 text-xs text-ink-400">{algo.statusDetails}</div>
                    </td>
                    <td className="py-3 text-ink-300">
                      <p>{algo.recommendation}</p>
                      {algo.notes && <p className="mt-1 text-xs text-ink-500">{algo.notes}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout type="warning" title="Do Not Oversimplify">
            <p className="text-ink-300">
              <strong>"SHA-256 is unbreakable" is wrong.</strong> SHA-256 has no known collisions, but we cannot prove it's unbreakable.
              The correct statement: "SHA-256 and SHA-3 are appropriate for suitable security-sensitive use."
              Security margins exist, but cryptanalysis advances. Monitor NIST guidance.
            </p>
          </Callout>
        </Card>
      </Section>

      <Section title="Countermeasures">
        <div className="space-y-4">
          {countermeasures.map((cm, i) => (
            <Card key={i} className="space-y-2">
              <h3 className="font-semibold text-ink-100">{cm.title}</h3>
              <p className="text-ink-300">{cm.description}</p>
              <p className="text-xs text-ink-500">Source: {cm.source}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Lessons Learned">
        <Card className="space-y-3">
          {lessonsLearned.map((lesson, i) => (
            <div key={i} className="flex gap-3 p-3 bg-ink-800/50 rounded-lg">
              <span className="text-teal-400 font-mono text-lg">#{i + 1}</span>
              <p className="text-ink-300">{lesson}</p>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Knowledge Check" description="8–12 interactive questions with immediate feedback">
        <Card className="space-y-6">
          {knowledgeChecks.map((q, i) => (
            <QuizQuestion key={i} index={i} question={q} answer={quizAnswers[i]} onAnswer={(ans) => setQuizAnswers(prev => ({ ...prev, [i]: ans }))} showScore={quizScore !== null} />
          ))}

          <div className="flex gap-4 pt-4 border-t border-ink-700">
            <button onClick={handleQuizSubmit} disabled={quizScore !== null} className="btn-primary">
              {quizScore !== null ? `Score: ${quizScore}/${knowledgeChecks.length}` : 'Submit Answers'}
            </button>
            <button onClick={handleQuizReset} className="btn-secondary">Reset</button>
          </div>

          {quizScore !== null && (
            <Callout type={quizScore >= 8 ? 'success' : quizScore >= 5 ? 'warning' : 'danger'} title="Results">
              <p className="text-ink-300">
                You scored <strong>{quizScore} out of {knowledgeChecks.length}</strong>.
                {quizScore >= 8 ? 'Excellent understanding!' : quizScore >= 5 ? 'Good, but review the explanations.' : 'Please review the material and try again.'}
              </p>
            </Callout>
          )}
        </Card>
      </Section>

      <Section title="Faculty Review Q&A" description="10–15 likely review questions with concise model answers">
        <Card className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-100">Question {qaIndex + 1} of {facultyQA.length}</h3>
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <button onClick={() => setQaIndex(Math.max(0, qaIndex - 1))} disabled={qaIndex === 0} className="btn-secondary text-xs px-2 py-1">← Prev</button>
              <span>{qaIndex + 1} / {facultyQA.length}</span>
              <button onClick={() => setQaIndex(Math.min(facultyQA.length - 1, qaIndex + 1))} disabled={qaIndex === facultyQA.length - 1} className="btn-secondary text-xs px-2 py-1">Next →</button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={qaIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <FacultyQAItem question={facultyQA[qaIndex]?.question ?? 'Question not found'} answer={facultyQA[qaIndex]?.answer ?? ''} />
            </motion.div>
          </AnimatePresence>
        </Card>
      </Section>
    </div>
  );
}

function QuizQuestion({ index, question, answer, onAnswer, showScore }: { index: number; question: KnowledgeCheckQuestion; answer?: string; onAnswer: (ans: string) => void; showScore: boolean }) {
  const isCorrect = answer && (
    question.type === 'true-false'
      ? answer === (question.correct ? 'true' : 'false')
      : (question.options?.find((o: { id: string; correct?: boolean }) => o.correct)?.id === answer)
  );

  return (
    <div className={`space-y-3 p-4 rounded-lg ${showScore ? (isCorrect ? 'bg-teal-900/20 border border-teal-800' : 'bg-red-900/20 border border-red-800') : 'bg-ink-800/50 border border-ink-700'}`}>
      <div className="flex items-center gap-2">
        <Badge variant={question.type === 'true-false' ? 'info' : 'default'}>Q{index + 1}</Badge>
        <span className="font-medium text-ink-100">{question.question}</span>
      </div>

      {question.type === 'true-false' ? (
        <div className="flex gap-4">
          {(['true', 'false'] as const).map((val) => (
            <label key={val} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition-all ${answer === val ? (isCorrect ? 'bg-teal-900/30 border-teal-800' : 'bg-red-900/30 border-red-800') : 'bg-ink-800 hover:bg-ink-700'} border`}>
              <input type="radio" name={`q${index}`} value={val} checked={answer === val} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAnswer(e.target.value)} className="accent-teal-500" disabled={showScore} />
              <span className="capitalize">{val}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {question.options?.map((opt: { id: string; text: string }) => (
            <label key={opt.id} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition-all ${answer === opt.id ? (isCorrect ? 'bg-teal-900/30 border-teal-800' : 'bg-red-900/30 border-red-800') : 'bg-ink-800 hover:bg-ink-700'} border`}>
              <input type="radio" name={`q${index}`} value={opt.id} checked={answer === opt.id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAnswer(e.target.value)} className="accent-teal-500" disabled={showScore} />
              <span>{opt.text}</span>
            </label>
          ))}
        </div>
      )}

      {showScore && answer && (
        <Callout type={isCorrect ? 'success' : 'danger'}>
          <p className="text-ink-300 whitespace-pre-wrap">{question.explanation}</p>
        </Callout>
      )}
    </div>
  );
}

function FacultyQAItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-ink-800/50 rounded-lg p-6">
      <h4 className="font-semibold text-ink-100 mb-3">{question}</h4>
      <details className="group">
        <summary className="cursor-pointer text-teal-400 hover:text-teal-300 flex items-center gap-2">
          Show Model Answer
          <span className="ml-auto transition-transform group-open:rotate-90">▸</span>
        </summary>
        <div className="mt-3 p-4 bg-ink-900 rounded border border-ink-700 text-ink-300 leading-relaxed whitespace-pre-wrap">
          {answer}
        </div>
      </details>
    </div>
  );
}