import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';
import { mockApi } from './mockFetch';

describe('<App />', () => {
  it('loads and shows tickets from the API', async () => {
    mockApi();
    render(<App />);

    expect(await screen.findByText('Checkout page times out')).toBeInTheDocument();
    expect(screen.getByText('Login fails with SSO')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('shows an error when tickets fail to load', async () => {
    mockApi([], { 'GET /api/tickets': () => [500, { error: 'Internal server error' }] });
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Internal server error');
  });

  it('adds a newly created ticket to the top of the list', async () => {
    mockApi();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Checkout page times out');

    await user.type(screen.getByLabelText('Title'), 'Search bar is slow');
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.click(screen.getByRole('button', { name: 'Create ticket' }));

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(within(items[0]).getByText('Search bar is slow')).toBeInTheDocument();
    expect(within(items[0]).getByText('Open')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  it('moves a ticket to In Progress when Start is clicked', async () => {
    const fetchMock = mockApi();
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Checkout page times out');

    const ticket = screen.getByTestId('ticket-1');
    await user.click(within(ticket).getByRole('button', { name: 'Start' }));

    expect(await within(ticket).findByText('In Progress')).toBeInTheDocument();
    expect(within(ticket).getByRole('button', { name: 'Resolve' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/tickets/1/status', expect.objectContaining({ method: 'PATCH' }));
  });

  it('shows the server error when a status change is rejected', async () => {
    mockApi(undefined, {
      'PATCH /api/tickets/3/status': () => [409, { error: 'Cannot move ticket from in_progress to resolved' }],
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Login fails with SSO');

    await user.click(within(screen.getByTestId('ticket-3')).getByRole('button', { name: 'Resolve' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot move ticket from in_progress to resolved');
  });
});
