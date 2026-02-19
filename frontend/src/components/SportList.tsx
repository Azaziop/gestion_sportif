import { useEffect, useState } from 'react';
import { sportService } from '../services/sportService';
import type { Sport } from '../types';

interface SportListProps {
  onSelectSport: (sport: Sport) => void;
}

export default function SportList({ onSelectSport }: SportListProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      setLoading(true);
      const data = await sportService.getAllSports();
      setSports(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des sports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSports = sports.filter((sport) =>
    sport.nom.toLowerCase().includes(filter.toLowerCase()) ||
    sport.lieu.toLowerCase().includes(filter.toLowerCase())
  );

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'PREVU':
        return 'badge-info';
      case 'EN_COURS':
        return 'badge-warning';
      case 'TERMINE':
        return 'badge-success';
      case 'ANNULE':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'PREVU':
        return 'Prévu';
      case 'EN_COURS':
        return 'En cours';
      case 'TERMINE':
        return 'Terminé';
      case 'ANNULE':
        return 'Annulé';
      default:
        return statut;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des activités sportives...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button
          onClick={loadSports}
          className="ml-2 underline font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Activités sportives disponibles</h2>
        <input
          type="text"
          placeholder="Rechercher par nom ou lieu..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-input"
        />
      </div>

      {filteredSports.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucune activité trouvée</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSports.map((sport) => (
            <div
              key={sport.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectSport(sport)}
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-bold text-lg text-gray-800">{sport.nom}</h3>
                <span className={`badge ${getStatutBadgeClass(sport.statut)}`}>
                  {getStatutLabel(sport.statut)}
                </span>
              </div>

              {sport.description && (
                <p className="text-gray-600 text-sm mb-3">{sport.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Lieu:</span> {sport.lieu}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(sport.dateDebut).toLocaleDateString('fr-FR')}
                </p>
                {sport.coach && (
                  <p>
                    <span className="font-semibold">Coach:</span> {sport.coach}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm">
                  <span className="font-semibold">Places disponibles:</span>{' '}
                  {sport.capaciteMax - sport.capaciteActuelle}/{sport.capaciteMax}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(sport.capaciteActuelle / sport.capaciteMax) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSport(sport);
                }}
                className="btn btn-primary w-full mt-4"
              >
                Réserver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
