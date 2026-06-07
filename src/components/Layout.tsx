import { Link } from 'react-router-dom';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link to="/" className="text-gray-900 hover:text-rose-600 transition-colors font-semibold text-lg">
            Knitting &amp; Crochet
          </Link>
          <Link to="/calculator" className="text-sm text-gray-600 hover:text-rose-600 transition-colors">
            Stitch Calculator
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
