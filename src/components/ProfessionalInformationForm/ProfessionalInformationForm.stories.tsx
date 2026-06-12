import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import ProfessionalInformationForm from './ProfessionalInformationForm'

const meta = {
  title: 'components/ProfessionalInformationForm',
  component: ProfessionalInformationForm,
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
} satisfies Meta<typeof ProfessionalInformationForm>;

export default meta;
type Story = StoryObj<typeof meta>;