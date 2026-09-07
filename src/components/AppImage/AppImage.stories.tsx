import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AppImage from './AppImage';

const meta = {
  title: 'components/AppImage',
  component: AppImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text', description: 'Image source: a path, a remote URL, or a static import' },
    alt: { control: 'text', description: 'Alternative text, empty for a purely decorative image' },
    width: { control: 'number', description: 'Intrinsic width in pixels, unless the image is `fill`' },
    height: { control: 'number', description: 'Intrinsic height in pixels, unless the image is `fill`' },
    preload: { control: 'boolean', description: 'Preload the image — reserve it for the LCP image' },
    placeholder: {
      control: 'radio',
      options: ['empty', 'blur'],
      description: 'Preview shown while the image loads',
    },
    fallbackSrc: { control: 'text', description: 'Source to swap in when `src` fails to load' },
  },
  args: {
    src: '/zentrohr-logo.svg',
    alt: 'ZentroHR',
    width: 931,
    height: 202,
  },
} satisfies Meta<typeof AppImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The LCP image of a route: preloaded from the document head rather than lazy loaded. */
export const Preloaded: Story = {
  args: { preload: true },
};

/** A remote avatar, blurred until it arrives. */
export const WithBlurPlaceholder: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'Aditi Sharma',
    width: 110,
    height: 110,
    placeholder: 'blur',
  },
};

/** A broken source falls back to the placeholder avatar instead of a broken-image icon. */
export const WithFallback: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=does-not-exist',
    alt: 'Aditi Sharma',
    width: 110,
    height: 110,
    fallbackSrc: '/zentrohr-logo.svg',
  },
};

/** Sized by its container instead of by intrinsic dimensions — the parent must be positioned. */
export const Fill: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=3',
    alt: 'Aditi Sharma',
    width: undefined,
    height: undefined,
    fill: true,
    sizes: '96px',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 96, height: 96, overflow: 'hidden', borderRadius: '50%' }}>
        <Story />
      </div>
    ),
  ],
};
