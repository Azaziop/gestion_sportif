import React, { useEffect, useState } from 'react';
import { authService } from '../services/api';
import EditProfile from './EditProfile';
import ChangePassword from './ChangePassword';
import type { Adherent } from '../types';

interface UserProfileProps {
  onClose: () => void;
}

type ProfileView = 'view' | 'edit' | 'password';

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const [profile, setProfile] = useState<Adherent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ProfileView>('view');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<Adherent>) => {
    try {
      const updated = await authService.updateProfile(updates);
      setProfile(updated);
      setCurrentView('view');
      setSuccessMessage('Profil mis à jour avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(oldPassword, newPassword);
      setCurrentView('view');
      setSuccessMessage('Mot de passe modifié avec succès');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error || 'Profil non trouvé'}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Show edit or password change views
  if (currentView === 'edit') {
    return (
      <EditProfile
        profile={profile}
        onSave={handleUpdateProfile}
        onCancel={() => setCurrentView('view')}
      />
    );
  }

  if (currentView === 'password') {
    return (
      <ChangePassword
        onSave={handleChangePassword}
        onCancel={() => setCurrentView('view')}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-2">{profile.firstName} {profile.lastName}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                profile.status === 'ACTIVE' 
                  ? 'bg-green-400/30 text-green-100' 
                  : profile.status === 'SUSPENDED'
                  ? 'bg-red-400/30 text-red-100'
                  : 'bg-gray-400/30 text-gray-100'
              }`}>
                {profile.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200">
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setCurrentView('edit')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Modifier le profil
          </button>
          <button
            onClick={() => setCurrentView('password')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Changer le mot de passe
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Informations personnelles */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informations personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-gray-800">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Téléphone</p>
              <p className="font-semibold text-gray-800">{profile.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Date de naissance</p>
              <p className="font-semibold text-gray-800">{new Date(profile.dateOfBirth).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Adresse
          </h3>
          <div className="space-y-2">
            <p className="font-semibold text-gray-800">{profile.address}</p>
            <p className="text-gray-700">{profile.postalCode} {profile.city}</p>
            <p className="text-gray-700">{profile.country}</p>
          </div>
        </div>

        {/* Abonnement */}
        {profile.currentSubscription && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Abonnement actuel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <span className="inline-block px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-semibold">
                  {profile.currentSubscription.type}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Début</p>
                <p className="font-semibold text-gray-800">{new Date(profile.currentSubscription.startDate).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Fin</p>
                <p className="font-semibold text-gray-800">{new Date(profile.currentSubscription.endDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
