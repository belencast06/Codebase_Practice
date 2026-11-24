import { fetchTickets, updateTicketStatus } from '../api';
import { mockApi } from './mockFetch';

describe('api.js', () => {
  it('fetchTickets builds the query string', async () => {
    const fetchMock = mockApi();
    await fetchTickets({ status: 'open' });
    expect(fetchMock).toHaveBeenCalledWith('/api/tickets?status=open');
  });

  it('fetchTickets calls /api/tickets with no query when no params are given', async () => {
    const fetchMock = mockApi();
    await fetchTickets();
    expect(fetchMock).toHaveBeenCalledWith('/api/tickets');
  });

  it('updateTicketStatus sends a PATCH to /api/tickets/:id/status with the new status', async () => {
    const fetchMock = mockApi();
    const updated = await updateTicketStatus(1, 'in_progress');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tickets/1/status',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'in_progress' }) })
    );
    expect(updated.status).toBe('in_progress');
  });
});
