import { Link, useLocation } from 'react-router-dom';

function YarnBall({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="currentColor" />
      <g fill="none" stroke="#FBF7F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.85">
        <path d="M8 12.5c4 1.6 8.2 4.4 10.4 9.6" />
        <path d="M12 6.8C13 12 16.4 17.6 23 20" />
        <path d="M6.6 18.4C11.5 19 18 21.6 20.2 25.4" />
        <path d="M16.8 5.4C16.2 11 15.2 19.4 18 26" />
      </g>
    </svg>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const onCalculator = pathname.startsWith('/calculator');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white/85 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-900 hover:text-rose-600 transition-colors"
          >
            <YarnBall className="w-7 h-7 text-rose-500 shrink-0" />
            <span className="font-display font-semibold text-lg leading-none">
              Yarn &amp; Stitch
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link
              to="/"
              className={`transition-colors ${
                !onCalculator ? 'text-rose-600 font-semibold' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              Stash
            </Link>
            <Link
              to="/calculator"
              className={`transition-colors ${
                onCalculator ? 'text-rose-600 font-semibold' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              Stitch Calculator
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">{children}</main>

      <footer className="max-w-6xl mx-auto w-full px-4 py-6 text-xs text-gray-400">
        Made with warm hands and good yarn.
      </footer>
    </div>
  );
}
