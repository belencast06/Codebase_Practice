// PART 2 — FEATURE: ticket search UI (only if you finish Part 1 with time left)
//
// Add a search form to <App /> (above the ticket list):
//   - An input labelled "Search tickets"
//   - A submit button named "Search"
//   - Submitting calls GET /api/tickets?search=<term> and replaces the list with the results
//   - Submitting a blank search reloads all tickets via GET /api/tickets (no query string)
//   - When there are no results, the list shows "No tickets found."
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';
import { mockApi } from './mockFetch';

describe('FEATURE: search tickets', () => {
  it('searches the API and shows only matching tickets', async () => {
    const fetchMock = mockApi();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Checkout page times out');

    await user.type(screen.getByLabelText('Search tickets'), 'login');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(fetchMock).toHaveBeenCalledWith('/api/tickets?search=login');
    expect(await screen.findByText('Login fails with SSO')).toBeInTheDocument();
    expect(screen.queryByText('Checkout page times out')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('shows the empty state when nothing matches', async () => {
    mockApi();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Checkout page times out');

    await user.type(screen.getByLabelText('Search tickets'), 'refund');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByText('No tickets found.')).toBeInTheDocument();
  });

  it('reloads all tickets when a blank search is submitted', async () => {
    const fetchMock = mockApi();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Checkout page times out');

    await user.type(screen.getByLabelText('Search tickets'), 'login');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await screen.findByText('Login fails with SSO');

    await user.clear(screen.getByLabelText('Search tickets'));
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(fetchMock).toHaveBeenLastCalledWith('/api/tickets');
    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
  });
});
