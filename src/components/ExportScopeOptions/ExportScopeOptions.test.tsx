import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ExportScopeOptions from './ExportScopeOptions';
import { STRINGS } from '@/src/constants/strings';

describe('ExportScopeOptions', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both scopes with the default labels', () => {
    render(<ExportScopeOptions value="all" onChange={onChange} />);

    expect(screen.getByRole('radiogroup', { name: STRINGS.EXPORT_SCOPE_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: STRINGS.EXPORT_SCOPE_ALL })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: STRINGS.EXPORT_SCOPE_FILTERED })).toBeInTheDocument();
  });

  it('checks the radio matching the current value', () => {
    render(<ExportScopeOptions value="all" onChange={onChange} />);

    expect(screen.getByRole('radio', { name: STRINGS.EXPORT_SCOPE_ALL })).toBeChecked();
    expect(screen.getByRole('radio', { name: STRINGS.EXPORT_SCOPE_FILTERED })).not.toBeChecked();
  });

  it('reflects a filtered value', () => {
    render(<ExportScopeOptions value="filtered" onChange={onChange} />);

    expect(screen.getByRole('radio', { name: STRINGS.EXPORT_SCOPE_FILTERED })).toBeChecked();
    expect(screen.getByRole('radio', { name: STRINGS.EXPORT_SCOPE_ALL })).not.toBeChecked();
  });

  it('reports the picked scope', async () => {
    const user = userEvent.setup();
    render(<ExportScopeOptions value="all" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: STRINGS.EXPORT_SCOPE_FILTERED }));

    expect(onChange).toHaveBeenCalledWith('filtered');
  });

  it('lets the caller relabel the scopes', () => {
    render(
      <ExportScopeOptions
        value="all"
        onChange={onChange}
        allLabel={STRINGS.EXPORT_SCOPE_ALL_EMPLOYEES}
        filteredLabel="Just these rows"
      />
    );

    expect(screen.getByRole('radio', { name: STRINGS.EXPORT_SCOPE_ALL_EMPLOYEES })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Just these rows' })).toBeInTheDocument();
  });

  it('cannot be changed while disabled', async () => {
    const user = userEvent.setup();
    render(<ExportScopeOptions value="all" onChange={onChange} disabled />);

    const filteredRadio = screen.getByRole('radio', { name: STRINGS.EXPORT_SCOPE_FILTERED });

    expect(filteredRadio).toBeDisabled();

    await user.click(filteredRadio);

    expect(onChange).not.toHaveBeenCalled();
  });
});
