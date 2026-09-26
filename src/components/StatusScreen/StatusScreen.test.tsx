import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChevronLeft, RotateCw } from 'lucide-react';

import StatusScreen from './StatusScreen';

const illustration = { src: '/not-found-illustration.svg', width: 348, height: 266 };

describe('StatusScreen', () => {
  it('renders the heading, the explanation and the note', () => {
    render(
      <StatusScreen
        illustration={illustration}
        title="Something went wrong"
        description="Please try again."
        note="Contact support"
        actions={[]}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Something went wrong');
    expect(screen.getByText('Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Contact support')).toBeInTheDocument();
  });

  it('gives each sentence of an array description its own paragraph', () => {
    const { container } = render(
      <StatusScreen illustration={illustration} title="Title" description={['First.', 'Second.']} actions={[]} />
    );

    const paragraphs = [...container.querySelectorAll('p')].map((node) => node.textContent);
    expect(paragraphs).toEqual(['First.', 'Second.']);
  });

  it('leaves out the code and the note when they are not given', () => {
    const { container } = render(
      <StatusScreen illustration={illustration} title="Title" description="Body" actions={[]} />
    );

    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  it('renders the actions in order and calls the one that was clicked', async () => {
    const onBack = vi.fn();
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <StatusScreen
        illustration={illustration}
        title="Title"
        description="Body"
        actions={[
          { label: 'Go Back', icon: ChevronLeft, onClick: onBack },
          { label: 'Try Again', icon: RotateCw, onClick: onRetry, variant: 'primary' },
        ]}
      />
    );

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['Go Back', 'Try Again']);

    await user.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();
  });

  it('keeps the illustration out of the accessibility tree', () => {
    const { container } = render(
      <StatusScreen illustration={illustration} title="Title" description="Body" actions={[]} />
    );

    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });
});
