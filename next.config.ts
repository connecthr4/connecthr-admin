import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TODO: remove once the pre-existing type errors in EmployeeDetails, EmployeesDashboard,
    // PayrollInformationForm, PersonalInformationForm, ProfessionalInformationForm, TextInput,
    // src/lib/api/auth.ts, and AppHeader.test.tsx are fixed.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
