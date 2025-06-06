import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { Check } from 'lucide-react';
import { Notification } from '../components/ui/notification';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { getNextMonthCompetencia } from '../utils/dasDateUtils';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Carregar notificações do banco de dados
      const { data: existingNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar notificações:', error);
        return;
      }

      const notificationsList = existingNotifications || [];
      
      // Verificar se precisa criar notificação de boas-vindas
      const hasWelcomeNotification = notificationsList.some(n => n.type === 'welcome');
      if (!hasWelcomeNotification) {
        await createWelcomeNotification();
      }

      // Verificar e criar alertas de vencimento DAS
      await checkAndCreateDASAlerts();

      // Recarregar notificações após possíveis criações
      const { data: updatedNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setNotifications(updatedNotifications || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createWelcomeNotification = async () => {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user?.id,
          type: 'welcome',
          message: 'Bem-vindo ao FinManage MEI! Estamos felizes em tê-lo conosco.',
          read: false,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao criar notificação de boas-vindas:', error);
    }
  };

  const checkAndCreateDASAlerts = async () => {
    try {
      const now = new Date();
      
      // Buscar impostos DAS pendentes
      const { data: pendingDAS, error } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'Pendente')
        .gte('vencimento', now.toISOString().split('T')[0]); // Apenas vencimentos futuros ou hoje
      
      if (error) {
        console.error('Erro ao buscar DAS pendentes:', error);
        return;
      }
      
      if (pendingDAS && pendingDAS.length > 0) {
        for (const das of pendingDAS) {
          const vencimento = new Date(das.vencimento);
          const daysUntilDue = Math.ceil((vencimento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          // Criar alerta se faltam 10 dias ou menos
          if (daysUntilDue <= 10 && daysUntilDue >= 0) {
            const alertKey = `das_specific_${das.id}`;
            
            const { data: existingAlert } = await supabase
              .from('notifications')
              .select('id')
              .eq('user_id', user?.id)
              .eq('type', 'das_alert')
              .eq('reference_key', alertKey)
              .single();

            if (!existingAlert) {
              const message = daysUntilDue === 0 
                ? `⚠️ URGENTE: DAS vence HOJE (${vencimento.toLocaleDateString('pt-BR')}) - Competência ${das.competencia}`
                : `🔔 DAS vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''} (${vencimento.toLocaleDateString('pt-BR')}) - Competência ${das.competencia}`;
              
              await supabase
                .from('notifications')
                .insert({
                  user_id: user?.id,
                  type: 'das_alert',
                  message,
                  read: false,
                  reference_key: alertKey,
                  created_at: new Date().toISOString()
                });
            }
          }
        }
      }
      
      // Também verificar se precisa criar alerta genérico para o próximo mês
      const nextMonthKey = getNextMonthCompetencia(now);
      const { data: nextMonthDAS } = await supabase
        .from('imposto_das')
        .select('id')
        .eq('user_id', user?.id)
        .eq('competencia', nextMonthKey)
        .single();
      
      // Se não existe DAS para o próximo mês e estamos nos últimos 5 dias do mês atual
      if (!nextMonthDAS && now.getDate() >= 25) {
        const alertKey = `das_reminder_${nextMonthKey}`;
        
        const { data: existingReminder } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user?.id)
          .eq('type', 'das_reminder')
          .eq('reference_key', alertKey)
          .single();
        
        if (!existingReminder) {
          await supabase
            .from('notifications')
            .insert({
              user_id: user?.id,
              type: 'das_reminder',
              message: `💡 Lembrete: Não esqueça de gerar o DAS para ${nextMonthKey} (vence dia 20)`,
              read: false,
              reference_key: alertKey,
              created_at: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar alertas DAS:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);
      
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">Carregando notificações...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-800">Notificações</h1>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <div className="divide-y">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`py-4 ${notification.read ? 'bg-white' : 'bg-emerald-50'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(notification.date)}</p>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsRead(notification.id)}
                      className="h-8 px-2"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Marcar como lida
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>Nenhuma notificação disponível</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;