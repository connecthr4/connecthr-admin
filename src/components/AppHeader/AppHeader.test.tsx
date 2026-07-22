import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { User } from '@/src/lib/types/auth';
import styles from './AppHeader.module.scss';

// Mock the child components using relative paths
vi.mock('../Breadcrumbs', () => ({
  default: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <div data-testid="breadcrumbs">
      {items.map((item, idx) => (
        <span key={idx}>{item.label}</span>
      ))}
    </div>
  ),
}));

vi.mock('../Typography', () => ({
  Heading3: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  Text1: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={className}>{children}</p>
  ),
  Text2: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
}));

vi.mock('lucide-react', () => ({
  Bell: () => <div data-testid="bell-icon" />,
  ChevronDown: () => <div data-testid="chevron-icon" />,
  CircleUserRound: () => <div data-testid="user-icon" />,
}));

import AppHeader from './AppHeader';

describe('AppHeader', () => {
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Manager',
    status: 'active',
    tempPassword: '',
    mustChangePassword: false,
  };

  const mockBreadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Employees', href: '/employees' },
    { label: 'John Doe' },
  ];

  describe('Basic Rendering', () => {
    it('should render with title only', () => {
      render(<AppHeader title="Dashboard" />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render title as heading', () => {
      render(<AppHeader title="Test Title" />);

      const heading = screen.getByText('Test Title');
      expect(heading).toBeInTheDocument();
    });

    it('should always render the notification button icon', () => {
      render(<AppHeader title="Test" />);

      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    });

    it('should render user avatar icon', () => {
      render(<AppHeader title="Test" />);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should render profile chevron dropdown icon', () => {
      render(<AppHeader title="Test" />);

      expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
    });
  });

  describe('Subtitle', () => {
    it('should render subtitle when provided', () => {
      render(<AppHeader title="Page Title" subtitle="Page Subtitle" />);

      expect(screen.getByText('Page Subtitle')).toBeInTheDocument();
    });

    it('should not render subtitle when not provided', () => {
      render(<AppHeader title="Page Title" />);

      const subtitleElement = screen.queryByText('Page Subtitle');
      expect(subtitleElement).not.toBeInTheDocument();
    });

    it('should render subtitle with special characters', () => {
      render(<AppHeader title="Title" subtitle="Subtitle with 'quotes' & special chars" />);

      expect(screen.getByText("Subtitle with 'quotes' & special chars")).toBeInTheDocument();
    });
  });

  describe('User Details', () => {
    it('should display user name from userDetails', () => {
      render(<AppHeader title="Dashboard" userDetails={mockUser} />);

      expect(screen.getByText('John Doe', { selector: `.${styles.profileName}` })).toBeInTheDocument();
    });

    it('should display user role from userDetails', () => {
      render(<AppHeader title="Dashboard" userDetails={mockUser} />);

      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    it('should display default user name when userDetails is null', () => {
      render(<AppHeader title="Dashboard" userDetails={null} />);

      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('should display default user role when userDetails is null', () => {
      render(<AppHeader title="Dashboard" userDetails={null} />);

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should display default user name when userDetails is undefined', () => {
      render(<AppHeader title="Dashboard" userDetails={undefined} />);

      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('should handle user with empty name string', () => {
      const userWithEmptyName: User = {
        ...mockUser,
        name: '',
      };

      render(<AppHeader title="Dashboard" userDetails={userWithEmptyName} />);

      // Empty string is falsy, so should show 'User'
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    it('should handle user with empty role string', () => {
      const userWithEmptyRole: User = {
        ...mockUser,
        role: '',
      };

      render(<AppHeader title="Dashboard" userDetails={userWithEmptyRole} />);

      // Empty string is falsy, so should show 'Admin'
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Breadcrumbs', () => {
    it('should render breadcrumbs when provided', () => {
      render(<AppHeader title="Employee Details" breadcrumbs={mockBreadcrumbs} />);

      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Employees')).toBeInTheDocument();
    });

    it('should not render breadcrumbs when array is empty', () => {
      render(<AppHeader title="Test" breadcrumbs={[]} />);

      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
    });

    it('should not render breadcrumbs when undefined', () => {
      render(<AppHeader title="Test" breadcrumbs={undefined} />);

      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument();
    });

    it('should render breadcrumbs with single item', () => {
      render(<AppHeader title="Test" breadcrumbs={[{ label: 'Home', href: '/' }]} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should render breadcrumbs with items without href', () => {
      render(<AppHeader title="Test" breadcrumbs={[{ label: 'Current Page' }]} />);

      expect(screen.getByText('Current Page')).toBeInTheDocument();
    });
  });

  describe('Complete Integration', () => {
    it('should render with all props provided', () => {
      render(
        <AppHeader
          title="Employee Directory"
          subtitle="Manage all employees"
          userDetails={mockUser}
          breadcrumbs={mockBreadcrumbs}
        />
      );

      expect(screen.getByText('Employee Directory')).toBeInTheDocument();
      expect(screen.getByText('Manage all employees')).toBeInTheDocument();
      expect(screen.getByText('John Doe', { selector: `.${styles.profileName}` })).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });

    it('should render with minimal props', () => {
      render(<AppHeader title="Minimal" />);

      expect(screen.getByText('Minimal')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Profile Section', () => {
    it('should render profile avatar', () => {
      render(<AppHeader title="Test" />);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should render profile info section with user details', () => {
      render(<AppHeader title="Test" userDetails={mockUser} />);

      expect(screen.getByText('John Doe', { selector: `.${styles.profileName}` })).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });

    it('should render profile dropdown icon', () => {
      render(<AppHeader title="Test" />);

      expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
    });
  });

  describe('Header Structure', () => {
    it('should render as header element', () => {
      const { container } = render(<AppHeader title="Test" />);

      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('should have left section with title', () => {
      const { container } = render(<AppHeader title="Test Title" />);

      const leftSection = container.querySelector(`.${styles.leftSection}`);
      expect(leftSection?.textContent).toContain('Test Title');
    });

    it('should have right section with profile', () => {
      const { container } = render(<AppHeader title="Test" />);

      const rightSection = container.querySelector(`.${styles.rightSection}`);
      expect(rightSection).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<AppHeader title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long subtitle', () => {
      const longSubtitle = 'B'.repeat(300);
      render(<AppHeader title="Title" subtitle={longSubtitle} />);

      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });

    it('should handle very long user name', () => {
      const userWithLongName: User = {
        ...mockUser,
        name: 'Very Long User Name That Should Display Completely And Maybe Overflow C'.repeat(3),
      };

      render(<AppHeader title="Test" userDetails={userWithLongName} />);

      expect(screen.getByText(userWithLongName.name)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      render(<AppHeader title="Dashboard & Reports | 2024" />);

      expect(screen.getByText('Dashboard & Reports | 2024')).toBeInTheDocument();
    });

    it('should handle angle brackets in title', () => {
      render(<AppHeader title="Title with <test>" />);

      // Note: angle brackets appear as literal characters in rendered text
      expect(screen.getByText('Title with <test>')).toBeInTheDocument();
    });

    it('should render with multiple breadcrumbs with special characters', () => {
      render(
        <AppHeader
          title="Test"
          breadcrumbs={[
            { label: 'Home & Dashboard', href: '/' },
            { label: 'Employees | HR', href: '/employees' },
            { label: 'Current > Item' },
          ]}
        />
      );

      expect(screen.getByText('Home & Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Employees | HR')).toBeInTheDocument();
      expect(screen.getByText('Current > Item')).toBeInTheDocument();
    });
  });
});
