import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BaseLayout from './BaseLayout';
import { getCurrentUser } from '@/src/lib/server/currentUser';
import { ROLES } from '@/src/lib/auth/roles';
import { ROUTES } from '@/src/constants/strings';

import type { User } from '@/src/lib/types/auth';

/*
`redirect` throws in Next.js so the render never continues past it. The mock
does the same, which is what lets the "must change password" case be asserted
on: the layout must not reach its markup.
*/
const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}));

vi.mock('@/src/lib/server/currentUser', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('../AuthHydrator', () => ({
  default: ({ user }: { user: User | null }) => <span>{`hydrate:${user?.email ?? 'null'}`}</span>,
}));

vi.mock('../LeftNavBar', () => ({
  default: ({ showUserManagement }: { showUserManagement?: boolean }) => (
    <nav>{`user-management:${showUserManagement ? 'shown' : 'hidden'}`}</nav>
  ),
}));

const user: User = {
  id: 'clx-current',
  name: 'Jane Doe',
  email: 'jane@example.com',
  role: ROLES.ADMIN,
  status: 'ACTIVE',
  mustChangePassword: false,
};

/**
 * `BaseLayout` is an async Server Component. React Testing Library cannot
 * render one directly, so it is awaited as the function it is and the element
 * it resolves to is rendered instead.
 */
async function renderLayout(children: React.ReactNode = <p>page content</p>) {
  const element = await BaseLayout({ children });

  return render(element);
}

describe('BaseLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(user);
  });

  it('renders the sidebar, the page content and the auth hydrator', async () => {
    await renderLayout();

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('page content');
    expect(screen.getByText('hydrate:jane@example.com')).toBeInTheDocument();
  });

  it('hands a null user to the hydrator when no session could be read', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await renderLayout();

    expect(screen.getByText('hydrate:null')).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('hides user management from an admin', async () => {
    await renderLayout();

    expect(screen.getByText('user-management:hidden')).toBeInTheDocument();
  });

  it('shows user management to a super admin', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...user, role: ROLES.SUPER_ADMIN });

    await renderLayout();

    expect(screen.getByText('user-management:shown')).toBeInTheDocument();
  });

  it('shows user management to IT', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...user, role: ROLES.IT });

    await renderLayout();

    expect(screen.getByText('user-management:shown')).toBeInTheDocument();
  });

  it('redirects a user who must change their password before rendering anything', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ ...user, mustChangePassword: true });

    await expect(renderLayout()).rejects.toThrow(`NEXT_REDIRECT:${ROUTES.RESET_PASSWORD}`);

    expect(redirectMock).toHaveBeenCalledWith(ROUTES.RESET_PASSWORD);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('does not redirect when nobody is signed in, even though there is no password to change', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await renderLayout();

    expect(redirectMock).not.toHaveBeenCalled();
  });
});
