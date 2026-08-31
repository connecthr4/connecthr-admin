import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import FileDropzone from './FileDropzone';
import { STRINGS } from '@/src/constants/strings';

/**
 * A PDF stands in for a real pick, so the filled story renders without needing a blob URL.
 */
const pickedFile = new File(['appointment letter'], 'appointment-letter.pdf', { type: 'application/pdf' });

const meta = {
  title: 'components/FileDropzone',
  component: FileDropzone,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Title above the box, and the accessible name of the file input',
    },
    hint: {
      control: 'text',
      description: 'Caption naming the formats the field accepts',
    },
    maxSizeMB: {
      control: 'number',
      description: 'Largest file the field takes, in megabytes',
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    label: STRINGS.UPLOAD_APPOINTMENT_LETTER,
    file: null,
    onChange: fn(),
  },
} satisfies Meta<typeof FileDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithFile: Story = {
  args: {
    file: pickedFile,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
