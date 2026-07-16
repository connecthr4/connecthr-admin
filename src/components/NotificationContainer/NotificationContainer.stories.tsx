import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import NotificationContainer from './NotificationContainer'

const meta = {
  title: 'components/NotificationContainer',
  component: NotificationContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { 
        control: 'text', 
        description: 'Sample label for the component' 
        },
  },
  args: { 
    /** onClick: fn() **/
    },
} satisfies Meta<typeof NotificationContainer>;

export default meta;
type Story = StoryObj<typeof meta>;