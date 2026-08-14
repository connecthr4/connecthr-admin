import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { User } from '@/src/lib/types/auth';
import AppHeader from './AppHeader';

const meta = {
  title: 'components/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Primary heading displayed at the top of the page',
    },
    subtitle: {
      control: 'text',
      description: 'Optional secondary text displayed below the title',
    },
    userDetails: {
      description: 'Authenticated user information displayed in the profile section',
    },
    breadcrumbs: {
      description: 'Optional list of breadcrumb items for navigation hierarchy',
    },
  },
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'SUPER_ADMIN',
  status: 'active',
  mustChangePassword: false,
};

/**
 * Default AppHeader with only a title.
 */
export const Default: Story = {
  args: {
    title: 'Dashboard',
  },
};

/**
 * AppHeader with title and subtitle.
 */
export const WithSubtitle: Story = {
  args: {
    title: 'All Employees',
    subtitle: 'Manage your employee roster and information',
  },
};

/**
 * AppHeader with user details displayed in the profile section.
 */
export const WithUserDetails: Story = {
  args: {
    title: 'Hello, John Doe',
    subtitle: 'Good morning',
    userDetails: mockUser,
  },
};

/**
 * AppHeader with breadcrumb navigation.
 */
export const WithBreadcrumbs: Story = {
  args: {
    title: 'Employee Details',
    subtitle: 'View and manage employee information',
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Employees', href: '/employees' },
      { label: 'John Doe' },
    ],
  },
};

/**
 * AppHeader with all features combined.
 */
export const Complete: Story = {
  args: {
    title: 'Employee Directory',
    subtitle: 'Manage all employees and their information',
    userDetails: mockUser,
    breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'HR Management' }, { label: 'Employees' }],
  },
};

/**
 * AppHeader with null user details (shows fallback values).
 */
export const NoUserDetails: Story = {
  args: {
    title: 'Page Title',
    subtitle: 'Page description',
    userDetails: null,
  },
};

/**
 * AppHeader with a long title that may wrap.
 */
export const LongTitle: Story = {
  args: {
    title: 'This is a very long page title that might wrap to multiple lines depending on the viewport width',
    subtitle: 'With a descriptive subtitle',
    userDetails: mockUser,
  },
};

/**
 * AppHeader demonstrating minimal content.
 */
export const Minimal: Story = {
  args: {
    title: 'Home',
  },
};
