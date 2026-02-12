// Dans votre service adhérents : components/Sidebar.tsx
import React, { useState } from 'react';

interface SidebarProps {
  currentView: 'list' | 'form' | 'details' | 'profile' | 'edit' | 'cours';
  onNavigate: (view: 'list' | 'form' | 'details' | 'profile' | 'edit' | 'cours') => void;
  onLogout: () => void;
  userRole: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, userRole }) => {
  const [isOpen, setIsOpen] = useState(true);

  const isAdmin = userRole === 'ADMIN';

  const menuItems = [
    ...(isAdmin ? [{
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Gestion Adhérents',
      view: 'list' as const,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: 'Nouvel Adhérent',
      view: 'form' as const,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      label: 'Gestion Cours',
      view: 'cours' as const,
    }] : []),
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Mon Profil',
      view: 'profile' as const,
    },
  ];

  const handleNavigation = (item: typeof menuItems[0]) => {
    if (item.view) {
      onNavigate(item.view);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-20 left-4 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative left-0 top-16 md:top-0 h-screen bg-white shadow-2xl border-r border-gray-200 transition-all duration-300 ease-in-out transform md:transform-none z-30 ${
          isOpen ? 'w-64' : 'w-0 md:w-20'
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className={`bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 shadow-lg overflow-hidden ${isOpen ? 'block' : 'hidden md:block'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {isOpen && (
                <div>
                  <h3 className="font-bold text-sm">Club Sportif</h3>
                  <p className="text-xs text-blue-100">Gestion Complète</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  currentView === item.view
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`flex-shrink-0 transition-transform duration-200 ${currentView === item.view ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                {isOpen && (
                  <span className="font-semibold text-sm truncate">{item.label}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-4 space-y-2">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 group"
              title="Paramètres"
            >
              <span className="flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              {isOpen && <span className="font-semibold text-sm">Paramètres</span>}
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group"
              title="Déconnexion"
            >
              <span className="flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              {isOpen && <span className="font-semibold text-sm">Déconnexion</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;