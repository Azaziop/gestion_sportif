import React, { useEffect, useState } from 'react';
import { adherentService } from '../services/api';

interface ReportsProps {
  onClose: () => void;
}

const Reports: React.FC<ReportsProps> = ({ onClose }) => {
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<any>(null);
  const [statusStats, setStatusStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [general, subscription, status] = await Promise.all([
        adherentService.getGeneralStatistics(),
        adherentService.getSubscriptionStatistics(),
        adherentService.getAdherentsByStatusReport()
      ]);
      setGeneralStats(general);
      setSubscriptionStats(subscription);
      setStatusStats(status);
    } catch (err: any) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <h2 className="text-3xl font-bold">Rapports et Statistiques</h2>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="space-y-8">
            {/* Statistiques générales */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Statistiques Générales</h3>
              {generalStats && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-600">Total Adhérents</p>
                    <p className="text-3xl font-bold text-blue-600">{generalStats.totalAdherents}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-600">Actifs</p>
                    <p className="text-3xl font-bold text-green-600">{generalStats.activeAdherents}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-600">Suspendus</p>
                    <p className="text-3xl font-bold text-red-600">{generalStats.suspendedAdherents}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-600">Expirés</p>
                    <p className="text-3xl font-bold text-orange-600">{generalStats.expiredAdherents}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Statistiques abonnements */}
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-4 text-green-900">Chiffre d'Affaires</h3>
              {subscriptionStats && (
                <div>
                  <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <p className="text-gray-600">Revenu Total</p>
                    <p className="text-4xl font-bold text-green-600">{subscriptionStats.totalRevenue}€</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {subscriptionStats.subscriptionDetails && Object.entries(subscriptionStats.subscriptionDetails).map((entry: any) => (
                      <div key={entry[0]} className="bg-white p-4 rounded-lg shadow">
                        <p className="font-bold text-lg">{entry[0]}</p>
                        <p className="text-gray-600">Prix: {entry[1].price}€</p>
                        <p className="text-gray-600">Abonnés: {entry[1].subscriberCount}</p>
                        <p className="text-green-600 font-bold">Revenu: {entry[1].revenue}€</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Statistiques par statut */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-4 text-purple-900">Adhérents par Statut</h3>
              {statusStats && (
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(statusStats).map((entry: any) => (
                    entry[0] !== 'generatedAt' && (
                      <div key={entry[0]} className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 font-semibold">{entry[0]}</p>
                        <p className="text-3xl font-bold text-purple-600">{entry[1]}</p>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Rapport mensuel */}
            <div className="bg-yellow-50 p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-4 text-yellow-900">Rapport Mensuel</h3>
              <div className="flex gap-4 mb-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border rounded-lg p-3"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border rounded-lg p-3"
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={loadReports}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg"
              >
                Charger Rapport
              </button>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
