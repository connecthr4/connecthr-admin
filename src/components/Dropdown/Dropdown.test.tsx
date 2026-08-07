import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Dropdown from './Dropdown';

const options = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Finance', value: 'finance' },
  { label: 'Quality Assurance', value: 'quality_assurance' },
];

/** The trigger is the only button carrying aria-expanded, so options never match it. */
const getTrigger = (expanded = false) => screen.getByRole('button', { expanded });

/** Once a value is selected the trigger shares its name with the option, so skip the trigger. */
const getOption = (name: string) => {
  const option = screen.getAllByRole('button', { name }).find((button) => !button.hasAttribute('aria-expanded'));

  if (!option) {
    throw new Error(`No option named "${name}" is rendered`);
  }

  return option;
};

const setup = (props: Partial<React.ComponentProps<typeof Dropdown>> = {}) => {
  const onChange = vi.fn();
  const user = userEvent.setup();
  const view = render(
    <Dropdown label="Department" placeholder="Select Department" options={options} onChange={onChange} {...props} />
  );

  return { onChange, user, ...view };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Dropdown', () => {
  it('renders the label and falls back to the placeholder while nothing is selected', () => {
    setup();

    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(getTrigger()).toHaveTextContent('Select Department');
  });

  it('marks the field as required', () => {
    setup({ required: true });

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows the label of the option matching the current value', () => {
    setup({ value: 'finance' });

    expect(getTrigger()).toHaveTextContent('Finance');
    expect(getTrigger()).not.toHaveTextContent('Select Department');
  });

  it('keeps the placeholder when the value matches no option', () => {
    setup({ value: 'not-a-real-value' });

    expect(getTrigger()).toHaveTextContent('Select Department');
  });

  it('opens the menu and lists every option', async () => {
    const { user } = setup();

    expect(screen.queryByRole('button', { name: 'Engineering' })).not.toBeInTheDocument();

    await user.click(getTrigger());

    expect(getTrigger(true)).toHaveAttribute('aria-expanded', 'true');
    options.forEach((option) => expect(getOption(option.label)).toBeInTheDocument());
  });

  it('toggles the menu closed when the trigger is clicked again', async () => {
    const { user } = setup();

    await user.click(getTrigger());
    await user.click(getTrigger(true));

    expect(screen.queryByRole('button', { name: 'Engineering' })).not.toBeInTheDocument();
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('reports the chosen value and closes the menu', async () => {
    const { user, onChange } = setup();

    await user.click(getTrigger());
    await user.click(getOption('Finance'));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('finance');
    expect(screen.queryByRole('button', { name: 'Engineering' })).not.toBeInTheDocument();
  });

  it('highlights the option matching the current value', async () => {
    const { user } = setup({ value: 'finance' });

    await user.click(getTrigger());

    expect(getOption('Finance').className).toMatch(/selectedOption/);
    expect(getOption('Engineering').className).not.toMatch(/selectedOption/);
  });

  it('selects without a handler attached', async () => {
    const user = userEvent.setup();
    render(<Dropdown label="Department" options={options} />);

    await user.click(getTrigger());
    await user.click(getOption('Finance'));

    expect(screen.queryByRole('button', { name: 'Engineering' })).not.toBeInTheDocument();
  });

  it('cannot be opened while disabled', async () => {
    const { user } = setup({ disabled: true });

    expect(getTrigger()).toBeDisabled();

    await user.click(getTrigger());

    expect(screen.queryByRole('button', { name: 'Engineering' })).not.toBeInTheDocument();
  });

  it('cannot be opened while loading', async () => {
    const { user } = setup({ isLoading: true });

    expect(getTrigger()).toBeDisabled();

    await user.click(getTrigger());

    expect(screen.queryByRole('button', { name: 'Engineering' })).not.toBeInTheDocument();
  });

  it('renders an error message', () => {
    setup({ error: 'Department is required' });

    expect(screen.getByText('Department is required')).toBeInTheDocument();
  });

  it('omits the error message when there is none', () => {
    const { container } = setup();

    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  describe('searchable', () => {
    it('filters options by label regardless of case', async () => {
      const { user } = setup({ searchable: true });

      await user.click(getTrigger());
      await user.type(screen.getByPlaceholderText('Search...'), 'fin');

      expect(getOption('Finance')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Engineering' })).not.toBeInTheDocument();
    });

    it('reports when nothing matches', async () => {
      const { user } = setup({ searchable: true });

      await user.click(getTrigger());
      await user.type(screen.getByPlaceholderText('Search...'), 'zzz');

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('ignores a whitespace-only search', async () => {
      const { user } = setup({ searchable: true });

      await user.click(getTrigger());
      await user.type(screen.getByPlaceholderText('Search...'), '   ');

      options.forEach((option) => expect(getOption(option.label)).toBeInTheDocument());
    });

    it('clears the search once an option is chosen', async () => {
      const { user } = setup({ searchable: true });

      await user.click(getTrigger());
      await user.type(screen.getByPlaceholderText('Search...'), 'fin');
      await user.click(getOption('Finance'));
      await user.click(getTrigger());

      expect(screen.getByPlaceholderText('Search...')).toHaveValue('');
    });

    it('has no search box when not searchable', async () => {
      const { user } = setup();

      await user.click(getTrigger());

      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });
  });

  it('reports an empty option list', async () => {
    const { user } = setup({ options: [] });

    await user.click(getTrigger());

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('closes and resets the search when clicking outside', async () => {
    const { user } = setup({ searchable: true });

    await user.click(getTrigger());
    await user.type(screen.getByPlaceholderText('Search...'), 'fin');
    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Finance' })).not.toBeInTheDocument();
    });

    await user.click(getTrigger());

    expect(screen.getByPlaceholderText('Search...')).toHaveValue('');
  });

  it('stays open when clicking inside the menu', async () => {
    const { user } = setup({ searchable: true });

    await user.click(getTrigger());
    await user.click(screen.getByPlaceholderText('Search...'));

    expect(getOption('Engineering')).toBeInTheDocument();
  });

  it('opens upward when there is not enough room below', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 600,
      bottom: 640,
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(700);

    const { user, container } = setup();

    await user.click(getTrigger());

    expect(container.querySelector('[class*="menu"]')?.className).toMatch(/menuUp/);
  });

  it('opens downward when there is room below', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 50,
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(700);

    const { user, container } = setup();

    await user.click(getTrigger());

    expect(container.querySelector('[class*="menu"]')?.className).not.toMatch(/menuUp/);
  });
});
