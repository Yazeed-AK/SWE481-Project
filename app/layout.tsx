import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';

export const metadata = {
  title: 'IMDb Clone',
  description: 'Movie browsing and renting application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-dark">
      <body className="bg-dark text-light min-vh-100 d-flex flex-column">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow-1">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
