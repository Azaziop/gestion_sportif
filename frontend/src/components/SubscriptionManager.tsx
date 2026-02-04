import React, { useEffect, useState } from 'react';
import { adherentService } from '../services/api';
import type { Subscription } from '../types';

interface SubscriptionManagerProps {
  onClose: () => void;
}

interface FormData {
  type: string;
  price: string;
  durationMonths: string;
  startDate: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onClose }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [formData, setFormData] = useState<FormData>({
    type: '',
    price: '',
    durationMonths: '',
    startDate: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const calculatedEndDate = (() => {
    if (!formData.startDate || !formData.durationMonths) {
      return '';
    }
    const start = new Date(formData.startDate);
    const months = parseInt(formData.durationMonths, 10);
    if (Number.isNaN(start.getTime()) || Number.isNaN(months)) {
      return '';
    }
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return end.toLocaleDateString('fr-FR');
  })();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await adherentService.getAllSubscriptions();
      setSubscriptions(Array.isArray(response) ? response : []);
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.price || !formData.durationMonths || !formData.startDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Modification
        await adherentService.updateSubscription(editingId, {
          type: formData.type,
          price: parseFloat(formData.price),
          durationMonths: parseInt(formData.durationMonths, 10),
          startDate: formData.startDate,
        });
        alert('Abonnement modifié avec succès');
      } else {
        // Création
        await adherentService.createSubscription({
          type: formData.type,
          price: parseFloat(formData.price),
          durationMonths: parseInt(formData.durationMonths, 10),
          startDate: formData.startDate,
        } as any);
        alert('Abonnement créé avec succès');
      }
      
      setFormData({ type: '', price: '', durationMonths: '', startDate: '' });
      setEditingId(null);
      await loadSubscriptions();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setFormData({
      type: subscription.type,
      price: subscription.price.toString(),
      durationMonths: subscription.durationMonths ? String(subscription.durationMonths) : '',
      startDate: subscription.startDate || ''
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ type: '', price: '', durationMonths: '', startDate: '' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) return;
    
    try {
      setLoading(true);
      await adherentService.deleteSubscription(id);
      await loadSubscriptions();
      alert('Abonnement supprimé');
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h2 className="text-3xl font-bold">Gestion des Abonnements</h2>
      </div>

      <div className="p-8">
        {/* Formulaire de création/modification */}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl mb-8">
          <h3 className="text-xl font-bold mb-4">
            {editingId ? '✏️ Modifier un abonnement' : '➕ Créer un nouvel abonnement'}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type d'abonnement</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="border rounded-lg p-3 w-full"
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="BASIC">BASIC - 3 séances/semaine</option>
                <option value="PREMIUM">PREMIUM - Illimité</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Prix (€)"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="border rounded-lg p-3 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée</label>
              <select
                value={formData.durationMonths}
                onChange={(e) => setFormData({...formData, durationMonths: e.target.value})}
                className="border rounded-lg p-3 w-full"
                required
              >
                <option value="">Sélectionner une durée</option>
                <option value="1">1 mois</option>
                <option value="3">Trimestre (3 mois)</option>
                <option value="12">Annuel (12 mois)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="border rounded-lg p-3 w-full"
                required
              />
              {calculatedEndDate && (
                <p className="text-xs text-gray-500 mt-2">Date de fin (calculée) : {calculatedEndDate}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`${
                editingId 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50`}
            >
              {loading ? (editingId ? 'Modification...' : 'Création...') : (editingId ? '💾 Enregistrer' : '➕ Créer')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold"
              >
                ❌ Annuler
              </button>
            )}
          </div>
        </form>

        {/* Liste des abonnements */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Prix (€)</th>
                <th className="p-4 text-center">Durée</th>
                <th className="p-4 text-center">Début</th>
                <th className="p-4 text-center">Fin</th>
                <th className="p-4 text-center">Séances/Semaine</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr 
                  key={sub.id} 
                  className={`border-t hover:bg-gray-50 ${editingId === sub.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="p-4 font-semibold">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      sub.type === 'PREMIUM' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sub.type}
                    </span>
                  </td>
                  <td className="p-4">{sub.price}€</td>
                  <td className="p-4 text-center">
                    <span className="text-xs text-gray-600">
                      {sub.durationMonths ? `${sub.durationMonths} mois` : '-'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs text-gray-600">
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString('fr-FR') : '-'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs text-gray-600">
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString('fr-FR') : '-'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-xs text-gray-600">
                      {sub.type === 'PREMIUM' ? '∞ (Illimité)' : '3'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(sub)}
                        disabled={loading}
                        className={`${
                          editingId === sub.id 
                            ? 'bg-blue-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white px-3 py-2 rounded text-sm font-semibold disabled:opacity-50`}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold disabled:opacity-50"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscriptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun abonnement créé. Créez-en un pour commencer.</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
