import React, { useState } from 'react';
import type { Adherent, Subscription } from '../types';
import { AdherentStatus } from '../types';
import { adherentService } from '../services/api';

interface AdherentDetailsProps {
  adherent: Adherent;
  onUpdate: () => void;
  onClose: () => void;
  onEdit?: () => void;
}

const AdherentDetails: React.FC<AdherentDetailsProps> = ({ adherent, onUpdate, onClose, onEdit }): React.ReactElement => {
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);

  // Debug: afficher la structure de l'adherent
  React.useEffect(() => {
    console.log('Adherent data:', {
      id: adherent.id,
      subscriptionType: adherent.subscriptionType,
      subscriptionPrice: adherent.subscriptionPrice,
      subscriptionStartDate: adherent.subscriptionStartDate,
      subscriptionDurationMonths: adherent.subscriptionDurationMonths,
      subscriptionEndDate: adherent.subscriptionEndDate,
      currentSubscription: adherent.currentSubscription
    });
  }, [adherent]);

  const loadSubscriptions = async () => {
    try {
      const response = await adherentService.getAllSubscriptions();
      setSubscriptions(Array.isArray(response) ? response : []);
    } catch (err: any) {
      alert('Erreur lors du chargement des abonnements: ' + err.message);
    }
  };

  const handleOpenSubscriptionModal = async () => {
    await loadSubscriptions();
    setShowSubscriptionModal(true);
  };

  const handleAssignSubscription = async (): Promise<void> => {
    if (!selectedSubscriptionId) {
      alert('Veuillez sélectionner un abonnement');
      return;
    }

    try {
      setLoading(true);
      
      // Si l'adhérent a déjà un abonnement, le retirer d'abord
      if (adherent.currentSubscription) {
        await adherentService.removeSubscriptionFromAdherent(adherent.id);
      }
      
      // Assigner le nouvel abonnement
      await adherentService.assignSubscriptionToAdherent(adherent.id, selectedSubscriptionId);
      alert('Abonnement assigné avec succès');
      setShowSubscriptionModal(false);
      setSelectedSubscriptionId(null);
      onUpdate();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (): Promise<void> => {
    if (!suspendReason.trim()) {
      alert('Veuillez fournir une raison de suspension');
      return;
    }

    try {
      setLoading(true);
      await adherentService.suspendAdherent(adherent.id, suspendReason);
      onUpdate();
      setShowSuspendForm(false);
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubscription = async (): Promise<void> => {
    if (!confirm("Retirer l'abonnement de cet adhérent ?")) {
      return;
    }

    try {
      setLoading(true);
      await adherentService.removeSubscriptionFromAdherent(adherent.id);
      alert("Abonnement retiré avec succès");
      onUpdate();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (): Promise<void> => {
    try {
      setLoading(true);
      await adherentService.reactivateAdherent(adherent.id);
      onUpdate();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'DEACTIVATED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case 'BASIC':
        return 'bg-blue-100 text-blue-800';
      case 'PREMIUM':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            {/* Photo de profil */}
            <div className="relative">
              {adherent.photo && adherent.photo.trim() ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                  <img 
                    src={adherent.photo.startsWith('data:') ? adherent.photo : `data:image/jpeg;base64,${adherent.photo}`}
                    alt={`${adherent.firstName} ${adherent.lastName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Erreur chargement photo:', e);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 shadow-xl">
                  <span className="text-2xl font-bold text-white">
                    {adherent.firstName[0]}{adherent.lastName[0]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1">
                {adherent.firstName} {adherent.lastName}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(adherent.status)}`}>
                  {adherent.status}
                </span>
                <span className="text-blue-100 text-sm">ID: #{adherent.id}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Personal Information Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informations personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Prénom</label>
                <p className="font-bold text-gray-800">{adherent.firstName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Nom</label>
                <p className="font-bold text-gray-800">{adherent.lastName}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Date de naissance</label>
                <p className="font-bold text-gray-800">{new Date(adherent.dateOfBirth).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 md:col-span-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Certificat médical</label>
                <p className="font-bold text-gray-800">
                  {adherent.medicalCertificate ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Fourni
                    </span>
                  ) : (
                    <span className="text-orange-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Non fourni
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Coordonnées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Email</label>
                <p className="font-bold text-gray-800">{adherent.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium">Téléphone</label>
                <p className="font-bold text-gray-800">{adherent.phoneNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Adresse
          </h3>
          <div className="space-y-2 bg-white/50 rounded-lg p-4">
            <p className="font-semibold text-gray-800 text-lg">{adherent.address}</p>
            <p className="text-gray-700">{adherent.postalCode} {adherent.city}</p>
            <p className="text-gray-700 font-medium">{adherent.country}</p>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Abonnement
          </h3>
          {(adherent.subscriptionType || adherent.currentSubscription) ? (
            <div className="bg-white/70 rounded-lg p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type d'abonnement */}
                {(adherent.subscriptionType || adherent.currentSubscription?.type) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 font-medium">Type</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getSubscriptionColor(String(adherent.subscriptionType || adherent.currentSubscription?.type))}`}>
                          {adherent.subscriptionType || adherent.currentSubscription?.type}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Prix */}
                {(adherent.subscriptionPrice || adherent.currentSubscription?.price) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 font-medium">Prix</label>
                      <p className="font-bold text-gray-800 text-lg">{adherent.subscriptionPrice ?? adherent.currentSubscription?.price}€</p>
                    </div>
                  </div>
                )}
                {/* Durée */}
                {adherent.subscriptionDurationMonths && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 font-medium">Durée</label>
                      <p className="font-bold text-gray-800">{adherent.subscriptionDurationMonths} mois</p>
                    </div>
                  </div>
                )}
                
                {/* Statut actif/inactif */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Statut</label>
                    <p className="font-bold text-gray-800">
                      {(() => {
                        const startDate = adherent.subscriptionStartDate || adherent.currentSubscription?.startDate;
                        const endDate = adherent.subscriptionEndDate || adherent.currentSubscription?.endDate;
                        if (!startDate || !endDate) return <span className="text-gray-500">-</span>;
                        const now = new Date();
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        const isActive = start <= now && end >= now;
                        return isActive ? (
                          <span className="text-green-600">✓ Actif</span>
                        ) : (
                          <span className="text-red-600">✗ Inactif</span>
                        );
                      })()}
                    </p>
                  </div>
                </div>
                
                {/* Limite hebdomadaire */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Limite</label>
                    <p className="font-bold text-gray-800">
                      {(adherent.subscriptionType || adherent.currentSubscription?.type) === 'PREMIUM' ? (
                        <span className="text-purple-600">∞ Illimité</span>
                      ) : (
                        <span className="text-blue-600">3 séances/semaine</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Date de début */}
                {(adherent.subscriptionStartDate || adherent.currentSubscription?.startDate) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 font-medium">Début</label>
                      <p className="font-bold text-gray-800">
                        {new Date(adherent.subscriptionStartDate || adherent.currentSubscription!.startDate!).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Date de fin */}
                {(adherent.subscriptionEndDate || adherent.currentSubscription?.endDate) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7V3m-8 4V3m-2 8h12M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 font-medium">Fin</label>
                      <p className="font-bold text-gray-800">
                        {new Date(adherent.subscriptionEndDate || adherent.currentSubscription!.endDate!).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/50 rounded-lg p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">Aucun abonnement actif</p>
            </div>
          )}
        </div>

        {/* Suspension Info */}
        {adherent.status === AdherentStatus.SUSPENDED && adherent.suspendedReason && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Suspension active
            </h3>
            <div className="bg-white/70 rounded-lg p-5 space-y-3">
              <div>
                <label className="text-sm text-gray-600 font-medium">Raison</label>
                <p className="font-semibold text-gray-800 mt-1">{adherent.suspendedReason}</p>
              </div>
              {adherent.suspendedDate && (
                <div>
                  <label className="text-sm text-gray-600 font-medium">Date de suspension</label>
                  <p className="font-semibold text-gray-800">{new Date(adherent.suspendedDate).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline Card */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historique
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <label className="text-sm text-gray-500 font-medium">Créé le</label>
                  <p className="font-semibold text-gray-800">{new Date(adherent.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-sm text-gray-500">{new Date(adherent.createdAt).toLocaleTimeString('fr-FR')}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <label className="text-sm text-gray-500 font-medium">Modifié le</label>
                  <p className="font-semibold text-gray-800">{new Date(adherent.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-sm text-gray-500">{new Date(adherent.updatedAt).toLocaleTimeString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-3">
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier l'adhérent
            </button>
          )}

          {adherent.status === 'ACTIVE' && !showSuspendForm && (
            <button
              onClick={() => setShowSuspendForm(true)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Suspendre l'adhérent
            </button>
          )}

          {adherent.status === 'SUSPENDED' && (
            <button
              onClick={handleReactivate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Réactivation...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Réactiver l'adhérent
                </>
              )}
            </button>
          )}

          {showSuspendForm && (
            <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Raison de la suspension *</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full border-2 border-red-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  rows={4}
                  placeholder="Entrez la raison de la suspension..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSuspend}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? 'Suspension...' : 'Confirmer la suspension'}
                </button>
                <button
                  onClick={() => {
                    setShowSuspendForm(false);
                    setSuspendReason('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Subscription Assignment Modal */}
    {showSubscriptionModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {adherent.currentSubscription ? 'Modifier l\'abonnement' : 'Assigner un abonnement'}
            </h3>
            <p className="text-gray-500">Sélectionnez un abonnement pour {adherent.firstName} {adherent.lastName}</p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubscriptionId(sub.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedSubscriptionId === sub.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-gray-800">{sub.type}</h4>
                    <span className="text-2xl font-bold text-purple-600">{sub.price}€</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {sub.type === 'PREMIUM' ? 'Accès illimité' : '3 séances/semaine'}
                  </p>
                  {selectedSubscriptionId === sub.id && (
                    <div className="mt-2 flex items-center gap-2 text-green-600 font-semibold">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      Sélectionné
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun abonnement disponible</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleAssignSubscription}
              disabled={loading || !selectedSubscriptionId}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              {loading ? 'Assignation...' : 'Confirmer'}
            </button>
            <button
              onClick={() => {
                setShowSubscriptionModal(false);
                setSelectedSubscriptionId(null);
              }}
              disabled={loading}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default AdherentDetails;
