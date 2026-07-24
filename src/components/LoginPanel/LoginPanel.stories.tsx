import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NotificationProvider } from '@/src/providers/NotificationProvider';
import LoginPanel from './LoginPanel';

const meta = {
  title: 'components/LoginPanel',
  component: LoginPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NotificationProvider>
        <Story />
      </NotificationProvider>
    ),
  ],
  argTypes: {
    step: {
      control: 'select',
      options: ['login', 'reset-password'],
      description: 'Which auth step of the panel to display',
    },
  },
  args: {
    step: 'login',
  },
} satisfies Meta<typeof LoginPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {};

export const ResetPassword: Story = {
  args: {
    step: 'reset-password',
  },
};
