import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import AuthHydrator from './AuthHydrator';
import { useAuthStore } from '@/src/store/auth';
import { ROLES } from '@/src/lib/auth/roles';

import type { User } from '@/src/lib/types/auth';

const user: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.ADMIN,
  status: 'ACTIVE',
  mustChangePassword: false,
};

describe('AuthHydrator', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('renders nothing', () => {
    const { container } = render(<AuthHydrator user={user} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('pushes the server-resolved user into the auth store on mount', () => {
    expect(useAuthStore.getState().user).toBeNull();

    render(<AuthHydrator user={user} />);

    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('clears the store when no session could be read', () => {
    useAuthStore.getState().setUser(user);

    render(<AuthHydrator user={null} />);

    expect(useAuthStore.getState().user).toBeNull();
  });

  it('re-hydrates the store when the user prop changes', () => {
    const { rerender } = render(<AuthHydrator user={user} />);

    const demoted: User = { ...user, role: ROLES.IT };
    rerender(<AuthHydrator user={demoted} />);

    expect(useAuthStore.getState().user).toEqual(demoted);
  });
});
