import { Server, BookOpen, Plus, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  currentPage: 'portal' | 'guide';
  setCurrentPage: (page: 'portal' | 'guide') => void;
  onAddSystem: () => void;
}

export default function Header({ currentPage, setCurrentPage, onAddSystem }: HeaderProps) {
  return (
    <header className="border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Серверный Портал
            </h1>
            <p className="text-xs text-slate-400">rep.local.inion</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('portal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentPage === 'portal'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Портал</span>
          </button>

          <button
            onClick={() => setCurrentPage('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentPage === 'guide'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Инструкция</span>
          </button>

          <button
            onClick={onAddSystem}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
