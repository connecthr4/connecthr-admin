import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import AuthHydrator from './AuthHydrator';
import { Text1, Text2 } from '../Typography';
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

/**
 * The component renders nothing of its own — its whole job is to push the
 * server-resolved user into the client store. This readout shows what the
 * store holds after it has run, so the story has something to look at.
 */
function AuthStoreReadout() {
  const storedUser = useAuthStore((state) => state.user);

  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <Text1>Auth store user</Text1>
      <Text2>{storedUser ? `${storedUser.name} (${storedUser.email}) — ${storedUser.role}` : 'null'}</Text2>
    </div>
  );
}

const meta = {
  title: 'components/AuthHydrator',
  component: AuthHydrator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: 'object',
      description: 'The user resolved during the server render, or null when no session could be read',
    },
  },
  args: {
    user,
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <AuthStoreReadout />
      </>
    ),
  ],
} satisfies Meta<typeof AuthHydrator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {};

export const SignedOut: Story = {
  args: {
    user: null,
  },
};
