import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Network, BookOpen, Database, Shield, Monitor, Server, Globe, Cpu, HardDrive, Settings } from 'lucide-react';
import { System } from '../types';

interface AddSystemModalProps {
  onClose: () => void;
  onAdd: (system: Omit<System, 'id'>) => void;
}

const iconOptions = [
  { value: 'network', label: 'Сеть', icon: <Network className="w-5 h-5" /> },
  { value: 'book', label: 'Документы', icon: <BookOpen className="w-5 h-5" /> },
  { value: 'database', label: 'База данных', icon: <Database className="w-5 h-5" /> },
  { value: 'shield', label: 'Безопасность', icon: <Shield className="w-5 h-5" /> },
  { value: 'monitor', label: 'Мониторинг', icon: <Monitor className="w-5 h-5" /> },
  { value: 'server', label: 'Сервер', icon: <Server className="w-5 h-5" /> },
  { value: 'globe', label: 'Веб', icon: <Globe className="w-5 h-5" /> },
  { value: 'cpu', label: 'Вычисления', icon: <Cpu className="w-5 h-5" /> },
  { value: 'harddrive', label: 'Хранилище', icon: <HardDrive className="w-5 h-5" /> },
  { value: 'settings', label: 'Настройки', icon: <Settings className="w-5 h-5" /> },
];

const colorOptions = [
  { value: 'from-blue-500 to-cyan-500', label: 'Синий' },
  { value: 'from-emerald-500 to-teal-500', label: 'Зелёный' },
  { value: 'from-violet-500 to-indigo-500', label: 'Фиолетовый' },
  { value: 'from-rose-500 to-pink-500', label: 'Розовый' },
  { value: 'from-amber-500 to-orange-500', label: 'Оранжевый' },
  { value: 'from-red-500 to-rose-500', label: 'Красный' },
];

export default function AddSystemModal({ onClose, onAdd }: AddSystemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('server');
  const [color, setColor] = useState('from-blue-500 to-cyan-500');
  const [status, setStatus] = useState<'active' | 'inactive' | 'maintenance'>('active');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    onAdd({ name, description, url, icon, color, status, category: category || 'Другое' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Добавить систему</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Название системы *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Grafana"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Описание
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание системы"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://rep.local.inion/system"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Категория
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Например: Monitoring"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Иконка
            </label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIcon(opt.value)}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    icon === opt.value
                      ? 'bg-violet-500/20 border border-violet-500/50 text-violet-300'
                      : 'bg-slate-700/30 border border-slate-600/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.icon}
                  <span className="text-[10px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Цвет
            </label>
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`w-full aspect-square rounded-xl bg-gradient-to-br ${opt.value} transition-all ${
                    color === opt.value
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Статус
            </label>
            <div className="flex gap-2">
              {[
                { value: 'active', label: 'Активна', color: 'bg-emerald-500' },
                { value: 'inactive', label: 'Недоступна', color: 'bg-red-500' },
                { value: 'maintenance', label: 'Обслуживание', color: 'bg-amber-500' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value as typeof status)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                    status === opt.value
                      ? 'bg-slate-700 border border-violet-500/50 text-white'
                      : 'bg-slate-700/30 border border-slate-600/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-violet-500/25"
            >
              Добавить
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
