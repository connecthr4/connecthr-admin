import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import BasePieChart from './BasePieChart';

const DEPARTMENTS = [
  { name: 'Business Analysis', value: 1 },
  { name: 'Design', value: 2 },
  { name: 'Development', value: 3 },
  { name: 'Engineering', value: 3 },
  { name: 'Finance', value: 3 },
  { name: 'HR', value: 5 },
  { name: 'Marketing', value: 1 },
  { name: 'Project Management', value: 3 },
  { name: 'QA', value: 2 },
];

const meta = {
  title: 'components/BasePieChart',
  component: BasePieChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    data: DEPARTMENTS,
    height: 320,
    centerValue: '23',
    centerLabel: 'Employees',
  },
} satisfies Meta<typeof BasePieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LegendBelow: Story = {
  args: {
    legendPosition: 'bottom',
  },
};

export const WithoutLegend: Story = {
  args: {
    showLegend: false,
  },
};
