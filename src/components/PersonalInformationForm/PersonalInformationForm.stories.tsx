import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import PersonalInformationForm from './PersonalInformationForm'

const meta = {
  title: 'components/PersonalInformationForm',
  component: PersonalInformationForm,
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
} satisfies Meta<typeof PersonalInformationForm>;

export default meta;
type Story = StoryObj<typeof meta>;