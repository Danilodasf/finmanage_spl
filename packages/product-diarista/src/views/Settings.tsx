import React, { useState, useEffect } from 'react';
import { DISettingsController, ProfileData, PasswordData, PreferencesData } from '../controllers/DISettingsController';

interface ProfileData {
  name: string;
  email: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings: React.FC = () => {
  // Instância do controlador DI
  const [settingsController] = useState(() => new DISettingsController());

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState<PreferencesData>({
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    notifications: true,
    darkMode: false
  });
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingProfile(true);
      try {
        // Carregar perfil
        const profileResult = await settingsController.loadProfile();
        if (profileResult.success && profileResult.data) {
          setProfileData(profileResult.data);
        }

        // Carregar preferências
        const preferencesResult = await settingsController.loadPreferences();
        if (preferencesResult.success && preferencesResult.data) {
          setPreferences(preferencesResult.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadInitialData();
  }, [settingsController]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    
    try {
      const result = await settingsController.updateProfile(profileData);
      
      if (result.success) {
        showMessage('success', 'Perfil atualizado com sucesso!');
      } else {
        showMessage('error', result.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      showMessage('error', 'Erro interno do servidor');
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPassword(true);
    
    try {
      const result = await settingsController.updatePassword(passwordData);
      
      if (result.success) {
        showMessage('success', 'Senha alterada com sucesso!');
        
        // Limpar formulário
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showMessage('error', result.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      showMessage('error', 'Erro interno do servidor');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPreferences(true);
    
    try {
      const result = await settingsController.updatePreferences(preferences);
      
      if (result.success) {
        showMessage('success', 'Preferências salvas com sucesso!');
      } else {
        showMessage('error', result.error || 'Erro ao salvar preferências');
      }
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      showMessage('error', 'Erro interno do servidor');
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil' },
    { id: 'password', label: 'Senha' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-emerald-800">Configurações</h1>

        {/* Mensagem de Feedback */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Perfil */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Perfil</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      readOnly
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoadingProfile}
                    className="bg-emerald-800 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingProfile ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Senha */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                      minLength={6}
                    />
                    <p className="text-sm text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoadingPassword}
                    className="bg-emerald-800 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingPassword ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </form>
              </div>
            )}


          </div>
        </div>


      </div>
    </div>
  );
};

export default Settings;