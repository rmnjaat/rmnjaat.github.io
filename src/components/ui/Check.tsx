import { useState } from 'react';

interface Props {
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

/** One-question check. Wrong answers stay visible so the reader sees why. */
export default function Check({ question, options, answer, explain }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <section className="check" aria-label="Check your understanding">
      <div className="k">Check yourself</div>
      <p className="q">{question}</p>
      <div className="opts">
        {options.map((o, i) => {
          const state = picked === null ? undefined : i === answer ? 'right' : i === picked ? 'wrong' : undefined;
          return (
            <button key={i} type="button" className="opt" data-state={state} onClick={() => setPicked(i)} aria-pressed={picked === i}>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="why">
          <strong>{picked === answer ? 'Right. ' : 'Not quite. '}</strong>
          {explain}
        </p>
      )}
    </section>
  );
}
