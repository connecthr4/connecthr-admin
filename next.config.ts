import type { NextConfig } from 'next';

/**
 * Avatars and other record images are served by the backend, so the optimizer has to be told
 * that host is allowed. Derived from the same env var the API client reads, so a new
 * environment needs no second edit here.
 */
function apiRemotePattern() {
  try {
    const { protocol, hostname } = new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? '');
    return [{ protocol: protocol.replace(':', '') as 'http' | 'https', hostname }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...apiRemotePattern(),
      // Placeholder avatars used by the Storybook stories and the mock dashboards.
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  typescript: {
    // TODO: remove once the pre-existing type errors in EmployeeDetails, EmployeesDashboard,
    // PayrollInformationForm, PersonalInformationForm, ProfessionalInformationForm, TextInput,
    // src/lib/api/auth.ts, and AppHeader.test.tsx are fixed.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
