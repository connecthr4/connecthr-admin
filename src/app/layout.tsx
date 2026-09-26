import type { Metadata, Viewport } from 'next';
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

/*
The app has a single, light palette, so the UA is told as much in the head —
before any stylesheet loads. `globals.css` says the same thing, but only once it
has arrived; until then a reader whose OS prefers dark would get the UA's dark
system colors over the light surfaces beneath, which is `buttontext` going white
on a white menu. Drop this when there is a real dark theme to switch to.
*/
export const viewport: Viewport = {
  colorScheme: 'light',
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
