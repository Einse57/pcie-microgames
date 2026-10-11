import { useState, type FormEvent } from 'react';

const TOPICS = [
  { id: 'cxl-pooling', label: 'CXL memory pooling' },
  { id: 'retimers-si', label: 'Retimers / signal integrity' },
  { id: 'acs-iommu', label: 'ACS / IOMMU / ATS' },
  { id: 'other', label: 'Other' },
] as const;

type TopicId = (typeof TOPICS)[number]['id'];
type Status = 'idle' | 'sending' | 'done' | 'error';

export function NextTopicPoll() {
  const [topic, setTopic] = useState<TopicId | ''>('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic || status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, note: note.trim() || undefined }),
      });
      if (!res.ok) throw new Error('bad status');
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <p className="next-poll next-poll-done" role="status">
        Thanks — noted.
      </p>
    );
  }

  return (
    <form className="next-poll" onSubmit={submit}>
      <label className="next-poll-label" htmlFor="next-topic">
        What should we cover next?
      </label>
      <div className="next-poll-row">
        <select
          id="next-topic"
          value={topic}
          onChange={(ev) => setTopic(ev.target.value as TopicId | '')}
          required
        >
          <option value="" disabled>
            Pick a topic…
          </option>
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <button type="submit" className="ghost-btn next-poll-btn" disabled={!topic || status === 'sending'}>
          {status === 'sending' ? '…' : 'Send'}
        </button>
      </div>
      {topic === 'other' || note ? (
        <input
          className="next-poll-note"
          type="text"
          maxLength={280}
          placeholder="Optional note"
          value={note}
          onChange={(ev) => setNote(ev.target.value)}
          aria-label="Optional note"
        />
      ) : null}
      {status === 'error' ? (
        <p className="next-poll-err" role="alert">
          Couldn’t send — try again later.
        </p>
      ) : null}
    </form>
  );
}
