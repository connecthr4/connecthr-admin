import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import NotFoundScreen from './NotFoundScreen';

const meta = {
  title: 'components/NotFoundScreen',
  component: NotFoundScreen,
  parameters: {
    /*
    The screen fills whatever it is given, so it is shown at full size rather than centred in
    a box — the ornaments are placed against its edges and only read correctly that way.
    */
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {},
} satisfies Meta<typeof NotFoundScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The layout below the tablet breakpoint: no ornaments, and the two actions stacked. */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
