import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import AddHolidayModal from './AddHolidayModal'

const meta = {
  title: 'components/AddHolidayModal',
  component: AddHolidayModal,
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
} satisfies Meta<typeof AddHolidayModal>;

export default meta;
type Story = StoryObj<typeof meta>;