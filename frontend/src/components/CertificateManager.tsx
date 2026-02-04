import React, { useState } from 'react';
import { adherentService } from '../services/api';

interface CertificateManagerProps {
  adherentId: number;
  adherentName: string;
  onClose: () => void;
}

const CertificateManager: React.FC<CertificateManagerProps> = ({
  adherentId,
  adherentName,
  onClose
}) => {
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expiryDate) {
      setError('Veuillez sélectionner une date d\'expiration');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await adherentService.updateMedicalCertificate(adherentId, expiryDate);
      
      setSuccess(`Certificat médical mis à jour pour ${adherentName}`);
      setExpiryDate('');
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError('Erreur lors de la mise à jour du certificat');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculer la date minimale (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];
  // Calculer la date maximale (1 an à partir d'aujourd'hui)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Certificat Médical</h2>
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
              Date d'Expiration:
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={today}
              max={maxDateStr}
              className="w-full border-2 border-teal-300 rounded-lg p-3 focus:outline-none focus:border-teal-600"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Le certificat doit être valide pendant au moins 1 mois
            </p>
          </div>

          <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Un certificat médical à jour est requis pour participer aux activités.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
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

export default CertificateManager;
