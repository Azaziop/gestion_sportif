import { useState, useEffect } from 'react';
import AdherentList from './components/AdherentList.tsx';
import AdherentForm from './components/AdherentForm';
import AdherentDetails from './components/AdherentDetails';
import EditAdherentForm from './components/EditAdherentForm';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import UserProfile from './components/UserProfile';
import Reports from './components/Reports';
import SubscriptionManager from './components/SubscriptionManager';
import { authService } from './services/api';
import type { Adherent } from './types';

type View = 'list' | 'form' | 'details' | 'profile' | 'edit' | 'reports' | 'users' | 'subscriptions';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedAdherent, setSelectedAdherent] = useState<Adherent | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const role = authService.getUserRole();
      setUserRole(role);
      console.log('Utilisateur authentifié, rôle:', role);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleAuthLogout = () => {
      setIsAuthenticated(false);
      setUserRole(null);
      setSelectedAdherent(null);
      setCurrentView('list');
    };

    window.addEventListener('auth:logout', handleAuthLogout as EventListener);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout as EventListener);
    };
  }, []);

  const handleSelectAdherent = (adherent: Adherent) => {
    setSelectedAdherent(adherent);
    setCurrentView('details');
  };

  const handleCreateNew = () => {
    setCurrentView('form');
  };

  const handleFormSuccess = () => {
    setCurrentView('list');
  };

  const handleFormCancel = () => {
    setCurrentView('list');
  };

  const handleDetailsClose = () => {
    setSelectedAdherent(null);
    setCurrentView('list');
  };

  const handleDetailsUpdate = () => {
    setCurrentView('list');
  };

  const handleEdit = () => {
    setCurrentView('edit');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const viewKey = `${currentView}-${userRole ?? 'none'}`;

  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
        <Sidebar
          currentView={currentView}
          userRole={userRole}
          onNavigate={(view: View) => {
            setCurrentView(view);
            setSelectedAdherent(null);
          }}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          <div key={viewKey} className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
            {currentView === 'profile' && (
              <UserProfile onClose={() => setCurrentView('list')} />
            )}

            {currentView === 'reports' && userRole === 'ADMIN' && (
              <Reports onClose={() => setCurrentView('list')} />
            )}

            {currentView === 'subscriptions' && userRole === 'ADMIN' && (
              <SubscriptionManager onClose={() => setCurrentView('list')} />
            )}

            {currentView === 'list' && userRole === 'ADMIN' && (
              <AdherentList
                onSelectAdherent={handleSelectAdherent}
                onCreateNew={handleCreateNew}
              />
            )}

            {currentView === 'list' && userRole !== 'ADMIN' && (
              <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
                <div className="text-gray-400 mb-6">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">Accès réservé aux administrateurs</h3>
                <p className="text-gray-600 mb-6">Vous n'avez pas les permissions nécessaires pour accéder à la gestion des adhérents.</p>
                <button
                  onClick={() => setCurrentView('profile')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Voir mon profil
                </button>
              </div>
            )}

            {currentView === 'form' && userRole === 'ADMIN' && (
              <AdherentForm
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            )}

            {currentView === 'details' && selectedAdherent && userRole === 'ADMIN' && (
              <AdherentDetails
                adherent={selectedAdherent}
                onUpdate={handleDetailsUpdate}
                onClose={handleDetailsClose}
                onEdit={handleEdit}
              />
            )}

            {currentView === 'edit' && selectedAdherent && userRole === 'ADMIN' && (
              <EditAdherentForm
                adherent={selectedAdherent}
                onSuccess={handleDetailsUpdate}
                onCancel={() => setCurrentView('details')}
              />
            )}
          </div>
        </main>
      </div>
  );
}

export default App;
