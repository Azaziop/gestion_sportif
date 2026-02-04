import React, { useState } from 'react';
import { adherentService } from '../services/api';

interface SuspensionManagerProps {
  adherentId: number;
  adherentName: string;
  onClose: () => void;
}

const SuspensionManager: React.FC<SuspensionManagerProps> = ({
  adherentId,
  adherentName,
  onClose
}) => {
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'suspend' | 'reactivate'>('suspend');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const suspensionReasons = [
    'Non-paiement de cotisation',
    'Comportement inadapté',
    'Violation du règlement',
    'Certificat médical expiré',
    'Autre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (action === 'suspend' && !reason) {
      setError('Veuillez sélectionner une raison');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (action === 'suspend') {
        await adherentService.suspendAdherent(adherentId, reason);
        setSuccess(`${adherentName} a été suspendu`);
      } else {
        await adherentService.reactivateAdherent(adherentId);
        setSuccess(`${adherentName} a été réactivé`);
      }
      
      setReason('');
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(`Erreur lors de l'${action === 'suspend' ? 'suspension' : 'réactivation'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md">
      <div className={`bg-gradient-to-r ${action === 'suspend' ? 'from-red-600 to-orange-600' : 'from-green-600 to-emerald-600'} p-6 text-white`}>
        <h2 className="text-2xl font-bold">
          {action === 'suspend' ? 'Suspension' : 'Réactivation'}
        </h2>
        <p className="text-sm mt-1 opacity-90">{adherentName}</p>
      </div>

      <div className="p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Action:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="suspend"
                  checked={action === 'suspend'}
                  onChange={(e) => {
                    setAction(e.target.value as 'suspend' | 'reactivate');
                    setReason('');
                  }}
                  className="mr-2"
                />
                <span className="text-red-600 font-bold">Suspendre</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="reactivate"
                  checked={action === 'reactivate'}
                  onChange={(e) => setAction(e.target.value as 'suspend' | 'reactivate')}
                  className="mr-2"
                />
                <span className="text-green-600 font-bold">Réactiver</span>
              </label>
            </div>
          </div>

          {action === 'suspend' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Raison de la suspension:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border-2 border-red-300 rounded-lg p-3 focus:outline-none focus:border-red-600"
                required
              >
                <option value="">-- Sélectionner une raison --</option>
                {suspensionReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          {action === 'suspend' && (
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-sm text-gray-700">
                <strong>Avertissement:</strong> La suspension empêchera l'adhérent d'accéder au système jusqu'à réactivation.
              </p>
            </div>
          )}

          {action === 'reactivate' && (
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> L'adhérent pourra à nouveau accéder à son compte après réactivation.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 ${action === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 rounded-lg disabled:opacity-50`}
            >
              {loading ? 'Traitement...' : (action === 'suspend' ? 'Suspendre' : 'Réactiver')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-lg"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuspensionManager;
