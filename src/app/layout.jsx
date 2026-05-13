import { Toaster } from 'react-hot-toast';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata = {
  title: 'RFI Intelligence Platform',
  description: 'Sobha Design Defect Analysis · Azure OpenAI GPT-4o',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        {children}
      </body>
    </html>
  );
}
