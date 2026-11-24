import { useEffect, useState } from 'react';
import { fetchTickets, createTicket, updateTicketStatus } from './api';
import TicketForm from './components/TicketForm.jsx';
import TicketList from './components/TicketList.jsx';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets()
      .then(setTickets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(data) {
    setError('');
    try {
      const created = createTicket(data);
      setTickets((prev) => [created, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(id, status) {
    setError('');
    try {
      const updated = await updateTicketStatus(id, status);
      const ticket = tickets.find((t) => t.id === id);
      ticket.status = updated.status;
      setTickets(tickets);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="app">
      <header>
        <h1>Support Desk</h1>
      </header>

      <TicketForm onCreate={handleCreate} />

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {loading ? <p>Loading tickets…</p> : <TicketList tickets={tickets} onStatusChange={handleStatusChange} />}
    </main>
  );
}
