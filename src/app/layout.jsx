import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'RFI Intelligence Platform',
  description: 'Sobha Design Defect Analysis · Azure OpenAI GPT-4o',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        {children}
      </body>
    </html>
  );
}
