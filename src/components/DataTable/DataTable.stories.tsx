import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ColumnDef } from '@tanstack/react-table';
import DataTable from './DataTable';

interface Row {
  id: string;
  name: string;
  role: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
];

const rows: Row[] = Array.from({ length: 24 }, (_, index) => ({
  id: String(index + 1),
  name: `Employee ${index + 1}`,
  role: index % 2 === 0 ? 'Developer' : 'Designer',
}));

// `DataTable` is generic and wrapped in `memo()`, which TypeScript can't
// instantiate per call site — cast once here so story args stay typed.
const TypedDataTable = DataTable as unknown as (props: { data: Row[]; columns: ColumnDef<Row>[] }) => React.JSX.Element;

const meta = {
  title: 'components/DataTable',
  component: TypedDataTable,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof TypedDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { data: rows, columns },
};

export const Empty: Story = {
  args: { data: [], columns },
};
