import type { Meta, StoryObj } from '@storybook/nextjs-vite';
/**
import { fn } from 'storybook/test';
*/
import LeftNavBar from './LeftNavBar';

const meta = {
  title: 'components/LeftNavBar',
  component: LeftNavBar,
  parameters: {
    layout: 'centered',
    nextjs: {
      // Pins the route so the active nav item is stable across snapshots.
      navigation: {
        pathname: '/dashboard',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    /** onClick: fn() **/
  },
} satisfies Meta<typeof LeftNavBar>;

export default meta;
type Story = StoryObj<typeof meta>;
