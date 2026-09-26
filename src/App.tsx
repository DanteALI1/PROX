import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Portal from './components/Portal';
import InstallGuide from './components/InstallGuide';
import AddSystemModal from './components/AddSystemModal';
import { System } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<'portal' | 'guide'>('portal');
  const [showAddModal, setShowAddModal] = useState(false);
  const [systems, setSystems] = useState<System[]>([
    {
      id: '1',
      name: 'NetBox',
      description: 'DCIM & IPAM — управление инфраструктурой и IP-адресами',
      url: 'https://rep.local.inion/netbox',
      icon: 'network',
      color: 'from-blue-500 to-cyan-500',
      status: 'active',
      category: 'Infrastructure'
    },
    {
      id: '2',
      name: 'MediaWiki',
      description: 'Корпоративная wiki-система для документирования',
      url: 'https://rep.local.inion/wiki',
      icon: 'book',
      color: 'from-emerald-500 to-teal-500',
      status: 'active',
      category: 'Documentation'
    },
  ]);

  const handleAddSystem = (system: Omit<System, 'id'>) => {
    const newSystem: System = {
      ...system,
      id: Date.now().toString(),
    };
    setSystems([...systems, newSystem]);
    setShowAddModal(false);
  };

  const handleDeleteSystem = (id: string) => {
    setSystems(systems.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onAddSystem={() => setShowAddModal(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentPage === 'portal' && (
            <motion.div
              key="portal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Portal
                systems={systems}
                onDeleteSystem={handleDeleteSystem}
                onAddSystem={() => setShowAddModal(true)}
              />
            </motion.div>
          )}
          {currentPage === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InstallGuide />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showAddModal && (
          <AddSystemModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddSystem}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>Серверный Портал • rep.local.inion • {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
