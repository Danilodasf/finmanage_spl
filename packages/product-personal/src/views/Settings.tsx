import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { AuthController } from '@/controllers/AuthController';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoadingData(true);
      try {
        if (user) {
          // Obter nome do usuário a partir dos metadados ou do perfil
          let userName = '';
          
          // Tentar obter dos metadados do usuário
          if (user.user_metadata && user.user_metadata.name) {
            userName = user.user_metadata.name;
          }
          
          // Se não encontrou nos metadados, buscar do perfil
          if (!userName) {
            const { data } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', user.id)
              .single();
              
            if (data && data.name) {
              userName = data.name;
            }
          }
          
          setProfileData({
            name: userName || 'Usuário'
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus dados.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadUserData();
  }, [user]);
  
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
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    
    const success = await AuthController.updateProfile(profileData.name);
    
    if (success) {
      toast({
        title: "Perfil atualizado",
        description: "Seu nome de perfil foi atualizado com sucesso.",
      });
    }
    
    setIsLoadingProfile(false);
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingPassword(true);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setIsLoadingPassword(false);
      return;
    }
    
    const success = await AuthController.updatePassword(
      passwordData.currentPassword, 
      passwordData.newPassword
    );
    
    if (success) {
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      // Limpar formulário
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    
    setIsLoadingPassword(false);
  };

  if (isLoadingData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-lg">Carregando configurações...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-emerald-800">Configurações</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="password">Senha</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Perfil</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-emerald-800 hover:bg-emerald-700"
                  disabled={isLoadingProfile}
                >
                  {isLoadingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : 'Salvar Alterações'}
                </Button>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="password">
            <Card className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-emerald-800 hover:bg-emerald-700"
                  disabled={isLoadingPassword}
                >
                  {isLoadingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Alterando...
                    </>
                  ) : 'Alterar Senha'}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings; 