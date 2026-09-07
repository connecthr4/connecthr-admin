import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';
import './styleguide.css';
import { NotificationProvider } from '../providers/NotificationProvider';

const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ZentroHR',
  description: 'People-centered HR, simplified',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lexend.variable}>
      <body className="flex flex-col min-h-screen">
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
