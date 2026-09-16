import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  variable: '--font-prompt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ระบบการบ้านและการจองคิว | Homework & Booking System',
  description: 'ระบบการบ้านสำหรับนักเรียนและระบบจองคิวพบคุณครู',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${prompt.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-200 selection:text-sky-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
