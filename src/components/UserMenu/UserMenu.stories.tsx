import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { User } from '@/src/lib/types/auth';
import UserMenu from './UserMenu';

const meta = {
  title: 'components/UserMenu',
  component: UserMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    userDetails: {
      description: 'Authenticated user information shown on the trigger',
    },
    className: {
      control: 'text',
      description: 'Additional class name applied to the trigger',
    },
  },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'Manager',
  status: 'active',
  mustChangePassword: false,
};

/**
 * The profile chip as it appears for a signed-in user. Click it to reveal
 * the account actions.
 */
export const Default: Story = {
  args: {
    userDetails: mockUser,
  },
};

/**
 * Falls back to placeholder details when no user is loaded yet.
 */
export const NoUserDetails: Story = {
  args: {
    userDetails: null,
  },
};

/**
 * A long name is truncated rather than widening the chip.
 */
export const LongUserName: Story = {
  args: {
    userDetails: {
      ...mockUser,
      name: 'Bartholomew Featherstonehaugh-Cholmondeley',
      role: 'Senior Human Resources Business Partner',
    },
  },
};
