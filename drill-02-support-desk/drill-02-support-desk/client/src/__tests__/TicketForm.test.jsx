import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TicketForm from '../components/TicketForm.jsx';

describe('<TicketForm />', () => {
  it('disables submit until a title is entered', async () => {
    const user = userEvent.setup();
    render(<TicketForm onCreate={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'Create ticket' });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText('Title'), '   ');
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText('Title'), 'Real title');
    expect(button).toBeEnabled();
  });

  it('calls onCreate with the trimmed title and chosen priority', async () => {
    const onCreate = vi.fn().mockResolvedValue();
    const user = userEvent.setup();
    render(<TicketForm onCreate={onCreate} />);

    await user.type(screen.getByLabelText('Title'), '  Broken link  ');
    await user.selectOptions(screen.getByLabelText('Priority'), 'low');
    await user.click(screen.getByRole('button', { name: 'Create ticket' }));

    expect(onCreate).toHaveBeenCalledWith({ title: 'Broken link', priority: 'low' });
  });
});
