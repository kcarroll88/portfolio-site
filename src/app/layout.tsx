import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import CustomCursor from '@/components/CustomCursor';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Keenan Carroll — AI Builder & Systems Designer',
  description:
    'Keenan Carroll designs and builds AI-powered systems that automate real-world business operations. Based in Raleigh, NC.',
  openGraph: {
    title: 'Keenan Carroll — AI Builder & Systems Designer',
    description:
      'Building AI-powered infrastructure for real-world operations. Based in Raleigh, NC.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="noise">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
