import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import LoginPanel from './LoginPanel';

const meta = {
  title: 'components/LoginPanel',
  component: LoginPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof LoginPanel>;

export default meta;
type Story = StoryObj<typeof meta>;
