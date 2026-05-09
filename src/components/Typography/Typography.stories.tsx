import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import Typography from './Typography';

const meta = {
  title: 'components/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tag: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h6', 'p', 'span'],
      description: 'The semantic HTML tag for the typography element',
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'label', 'strong', 'em'],
      description: 'Overrides the rendered HTML element while keeping the styling of `tag`',
    },
    children: {
      control: 'text',
      description: 'The text content or elements inside Typography',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify', 'start', 'end', 'match-parent'],
      description: 'Text alignment',
    },
    transform: {
      control: 'select',
      options: ['none', 'uppercase', 'lowercase', 'capitalize'],
      description: 'Text transformation style',
    },
    truncation: {
      control: 'select',
      options: ['ellipsis', 'noWrap', 'lineClamp-1', 'lineClamp-2', 'lineClamp-3', 'lineClamp-4', 'lineClamp-5'],
      description: 'Truncates or clamps text display',
    },
    className: {
      control: 'text',
      description: 'Custom class name for additional styling',
    },
  },
  args: {
    tag: 'p',
    children: 'This is a sample typography text.',
    align: 'left',
    transform: 'none',
    truncation: undefined,
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {};

// Show heading variants
export const Headings: Story = {
  render: (args) => (
    <>
      <Typography {...args} tag="h1">
        Heading 1
      </Typography>
      <Typography {...args} tag="h2">
        Heading 2
      </Typography>
      <Typography {...args} tag="h3">
        Heading 3
      </Typography>
      <Typography {...args} tag="h4">
        Heading 4
      </Typography>
      <Typography {...args} tag="h6">
        Heading 6
      </Typography>
    </>
  ),
};

// Show alignments
export const Alignments: Story = {
  render: (args) => (
    <>
      <Typography {...args} align="left">
        Left aligned text
      </Typography>
      <Typography {...args} align="center">
        Center aligned text
      </Typography>
      <Typography {...args} align="right">
        Right aligned text
      </Typography>
      <Typography {...args} align="justify">
        Justify aligned text
      </Typography>
      <Typography {...args} align="start">
        Start aligned text
      </Typography>
      <Typography {...args} align="end">
        End aligned text
      </Typography>
      <Typography {...args} align="match-parent">
        Match-Parent aligned text
      </Typography>
    </>
  ),
};

// Show text transforms
export const Transforms: Story = {
  render: (args) => (
    <>
      <Typography {...args} transform="uppercase">
        Uppercase text
      </Typography>
      <Typography {...args} transform="lowercase">
        Lowercase Text
      </Typography>
      <Typography {...args} transform="capitalize">
        capitalize text
      </Typography>
    </>
  ),
};

// Show truncation styles
export const Truncations: Story = {
  render: (args) => (
    <div style={{ width: '250px' }}>
      <Typography {...args} truncation="ellipsis">
        This is a very long sentence that will be cut off with an ellipsis.
      </Typography>
      <Typography {...args} truncation="noWrap">
        This is a long text that will not wrap at all.
      </Typography>
      <Typography {...args} truncation="lineClamp-2">
        This is a long paragraph that will be clamped to two lines in height, and anything beyond that will be hidden
        from view.
      </Typography>
    </div>
  ),
};

// Playground with full controls
export const Playground: Story = {
  args: {
    tag: 'p',
    as: 'p',
    children: 'Edit me in Storybook controls!',
    align: 'left',
    transform: 'none',
    truncation: undefined,
  },
};
