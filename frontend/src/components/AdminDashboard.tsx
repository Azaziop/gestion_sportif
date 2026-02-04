import React from 'react';

interface AdminDashboardProps {
  onNavigateToSubscriptions: () => void;
  onNavigateToReports: () => void;
  onNavigateToUsers: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToSubscriptions,
  onNavigateToReports,
  onNavigateToUsers,
}) => {
  const features = [
    {
      id: 1,
      title: 'Gestion des Certificats Médicaux',
      description: 'Mettre à jour et valider les certificats médicaux des adhérents',
      icon: '📋',
      color: 'from-teal-600 to-cyan-600',
      status: '✓ Implémenté'
    },
    {
      id: 2,
      title: 'Suspension des Comptes',
      description: 'Suspendre et réactiver les comptes des adhérents',
      icon: '🚫',
      color: 'from-red-600 to-orange-600',
      status: '✓ Implémenté'
    },
    {
      id: 3,
      title: 'Gestion des Abonnements',
      description: 'Créer, modifier et supprimer les types d\'abonnements',
      icon: '💳',
      color: 'from-purple-600 to-indigo-600',
      action: onNavigateToSubscriptions,
      status: '✓ Implémenté'
    },
    {
      id: 4,
      title: 'Rapports et Statistiques',
      description: 'Consulter les statistiques générales et financières',
      icon: '📊',
      color: 'from-blue-600 to-indigo-600',
      action: onNavigateToReports,
      status: '✓ Implémenté'
    },
    {
      id: 5,
      title: 'Gestion des Rôles',
      description: 'Assigner les rôles et gérer les permissions des utilisateurs',
      icon: '👥',
      color: 'from-pink-600 to-rose-600',
      action: onNavigateToUsers,
      status: '✓ Implémenté'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Tableau de Bord Administrateur</h1>
        <p className="text-indigo-100">Accédez à toutes les fonctionnalités de gestion du club</p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`bg-gradient-to-br ${feature.color} rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}
              onClick={feature.action}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm opacity-90 mb-4">{feature.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                  {feature.status}
                </span>
                {feature.action && (
                  <span className="text-lg">→</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Section Informations */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-3">📚 Fonctionnalités Principales</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Gestion complète des adhérents</li>
              <li>✓ Validation des certificats médicaux</li>
              <li>✓ Gestion des suspensions</li>
              <li>✓ Abonnements et forfaits</li>
              <li>✓ Rapports financiers</li>
              <li>✓ Contrôle des accès</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-3">🎯 Statistiques</h3>
            <div className="text-sm text-green-800 space-y-2">
              <p>Suivez en temps réel:</p>
              <ul className="space-y-1">
                <li>✓ Nombre total d'adhérents</li>
                <li>✓ Adhérents actifs/suspendus</li>
                <li>✓ Revenu par abonnement</li>
                <li>✓ Certificats expirés</li>
                <li>✓ Distribution par rôles</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Aide rapide */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
          <h3 className="font-bold text-yellow-900 mb-2">💡 Conseil</h3>
          <p className="text-yellow-800 text-sm">
            Utilisez la barre latérale pour naviguer entre les différentes fonctionnalités. 
            Chaque section est conçue pour faciliter la gestion de votre club sportif.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
