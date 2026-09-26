import { motion } from 'framer-motion';
import { ExternalLink, Trash2, Network, BookOpen, Database, Shield, Monitor, Server, Globe, Cpu, HardDrive, Settings } from 'lucide-react';
import { System } from '../types';

interface PortalProps {
  systems: System[];
  onDeleteSystem: (id: string) => void;
  onAddSystem: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  network: <Network className="w-7 h-7" />,
  book: <BookOpen className="w-7 h-7" />,
  database: <Database className="w-7 h-7" />,
  shield: <Shield className="w-7 h-7" />,
  monitor: <Monitor className="w-7 h-7" />,
  server: <Server className="w-7 h-7" />,
  globe: <Globe className="w-7 h-7" />,
  cpu: <Cpu className="w-7 h-7" />,
  harddrive: <HardDrive className="w-7 h-7" />,
  settings: <Settings className="w-7 h-7" />,
};

const statusColors = {
  active: 'bg-emerald-400',
  inactive: 'bg-red-400',
  maintenance: 'bg-amber-400',
};

const statusLabels = {
  active: 'Активна',
  inactive: 'Недоступна',
  maintenance: 'Обслуживание',
};

export default function Portal({ systems, onDeleteSystem, onAddSystem }: PortalProps) {
  return (
    <div>
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-transparent"
        >
          Добро пожаловать
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-lg max-w-2xl mx-auto"
        >
          Выберите необходимую систему для работы или добавьте новую через кнопку «Добавить»
        </motion.p>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {systems.map((system, index) => (
          <motion.div
            key={system.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/5 hover:-translate-y-1 h-full flex flex-col">
              {/* Status indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusColors[system.status]} animate-pulse`}></span>
                <span className="text-xs text-slate-400">{statusLabels[system.status]}</span>
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${system.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                {iconMap[system.icon] || <Server className="w-7 h-7" />}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">{system.name}</h3>
              <p className="text-slate-400 text-sm mb-4 flex-grow">{system.description}</p>

              {/* Category badge */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 mb-4 w-fit">
                {system.category}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-700/50">
                <a
                  href={system.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 text-violet-300 hover:from-violet-500/30 hover:to-indigo-500/30 transition-all duration-200 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Открыть
                </a>
                <button
                  onClick={() => onDeleteSystem(system.id)}
                  className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add New System Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: systems.length * 0.1 }}
        >
          <button
            onClick={onAddSystem}
            className="w-full h-full min-h-[280px] border-2 border-dashed border-slate-600/50 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-300 group"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-all duration-300">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-slate-400 group-hover:text-violet-300 font-medium transition-colors">
              Добавить систему
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
