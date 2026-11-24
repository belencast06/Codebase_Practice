export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

// The one action available from each status.
const NEXT_ACTION = {
  open: { label: 'Start', to: 'in_progress' },
  in_progress: { label: 'Resolve', to: 'resolved' },
  resolved: { label: 'Reopen', to: 'open' },
};

export default function TicketList({ tickets, onStatusChange }) {
  if (tickets.length === 0) {
    return <p className="empty">No tickets found.</p>;
  }

  return (
    <ul className="ticket-list" aria-label="Tickets">
      {tickets.map((ticket) => {
        const action = NEXT_ACTION[ticket.status];
        return (
          <li key={ticket.id} className="ticket" data-testid={`ticket-${ticket.id}`}>
            <div className="ticket-main">
              <span className={`priority priority-${ticket.priority}`}>{ticket.priority}</span>
              <span className="title">{ticket.title}</span>
            </div>
            <div className="ticket-meta">
              <span className={`status status-${ticket.status}`}>{STATUS_LABELS[ticket.status]}</span>
              {action && (
                <button type="button" onClick={() => onStatusChange(ticket.id, action.to)}>
                  {action.label}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
