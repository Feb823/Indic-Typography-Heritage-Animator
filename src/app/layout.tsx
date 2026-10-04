import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Indic-Typography Heritage Animator | Google DeepMind Hackathon',
  description: 'An interactive generative fabric designer and real-time 3D clothing physics engine for traditional Indian textiles.',
  keywords: ['Kanchipuram', 'Banarasi', 'Kalamkari', 'Ikat', 'Gemini Omni Flash', 'Fashion Physics', 'Indian Handlooms'],
  authors: [{ name: 'Indic-Typography Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-yellow-500 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
