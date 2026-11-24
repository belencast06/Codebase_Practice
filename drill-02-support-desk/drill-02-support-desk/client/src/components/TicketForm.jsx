import { useState } from 'react';

export default function TicketForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreate({ title: title.trim(), priority });
    setTitle('');
    setPriority('medium');
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit} aria-label="New ticket">
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's wrong?" />
      </label>

      <label>
        Priority
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <button type="submit" disabled={!title.trim()}>
        Create ticket
      </button>
    </form>
  );
}
