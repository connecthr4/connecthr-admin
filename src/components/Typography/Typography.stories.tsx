import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Caption, Heading1, Heading2, Heading3, Heading4, Heading5, Text1, Text2, Text3, Text4 } from './Typography';

const meta = {
  title: 'Components/Typography',
  component: Text2,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify', 'start', 'end', 'match-parent'],
    },
    transform: {
      control: 'select',
      options: ['none', 'uppercase', 'lowercase', 'capitalize'],
    },
    truncation: {
      control: 'select',
      options: [undefined, 'ellipsis', 'noWrap', 'lineClamp-2', 'lineClamp-3'],
    },
    color: { control: 'color' },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
  },
} satisfies Meta<typeof Text2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = {};

export const HeadingOne: Story = {
  render: (args) => <Heading1 {...args} />,
  args: {
    children: 'Heading level 1',
  },
};

export const HeadingTwo: Story = {
  render: (args) => <Heading2 {...args} />,
  args: {
    children: 'Heading level 2',
  },
};

export const HeadingThree: Story = {
  render: (args) => <Heading3 {...args} />,
  args: {
    children: 'Heading level 3',
  },
};

export const HeadingFour: Story = {
  render: (args) => <Heading4 {...args} />,
  args: {
    children: 'Heading level 4',
  },
};

export const HeadingFive: Story = {
  render: (args) => <Heading5 {...args} />,
  args: {
    children: 'Heading level 5',
  },
};

export const BodyLarge: Story = {
  render: (args) => <Text1 {...args} />,
  args: {
    children: 'Larger body copy using the text1 variant.',
  },
};

export const BodySmall: Story = {
  render: (args) => <Text3 {...args} />,
  args: {
    children: 'Bold small copy using the text3 variant.',
  },
};

export const BodyRegular: Story = {
  render: (args) => <Text4 {...args} />,
  args: {
    children: 'Regular small copy using the text4 variant.',
  },
};

export const CaptionText: Story = {
  render: (args) => <Caption {...args} />,
  args: {
    children: 'A small caption used under images or fields.',
  },
};

export const Centered: Story = {
  args: {
    align: 'center',
    children: 'This text is centered within its container.',
  },
};

export const Uppercase: Story = {
  args: {
    transform: 'uppercase',
    children: 'This text is transformed to uppercase.',
  },
};

export const Truncated: Story = {
  args: {
    truncation: 'ellipsis',
    style: { maxWidth: 200 },
    children: 'This is a long line of text that will be truncated with an ellipsis.',
  },
};

export const CustomColor: Story = {
  args: {
    color: '#2563eb',
    children: 'This text uses a custom color.',
  },
};
