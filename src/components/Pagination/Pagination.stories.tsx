import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import Pagination from './Pagination'

const meta = {
  title: 'components/Pagination',
  component: Pagination,
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
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;