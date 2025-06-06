import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { Check, AlertTriangle, BellRing, Filter } from 'lucide-react';
interface Notification {
  id: number;
  message: string;
  date: string;
  created_at?: string;
  read: boolean;
  type?: 'info' | 'warning' | 'tax' | 'welcome' | 'das_alert' | 'das_reminder';
  priority?: 'high' | 'medium' | 'low';
}
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { getNextMonthCompetencia } from '../utils/dasDateUtils';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Carregar notificações do localStorage (mesma fonte do NotificationCenter)
      const savedNotifications = localStorage.getItem('mei_notifications');
      let notificationsList: Notification[] = [];
      
      if (savedNotifications) {
        try {
          notificationsList = JSON.parse(savedNotifications);
        } catch (error) {
          console.error('Erro ao carregar notificações do localStorage:', error);
        }
      }
      
      // Se não há notificações, gerar as automáticas
      if (notificationsList.length === 0) {
        await generateAutomaticNotifications();
        // Recarregar após gerar
        const updatedSaved = localStorage.getItem('mei_notifications');
        if (updatedSaved) {
          notificationsList = JSON.parse(updatedSaved);
        }
      }

      setNotifications(notificationsList);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAutomaticNotifications = async () => {
    if (!user) return;
    
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const automaticNotifications: Notification[] = [];
    
    try {
      // Buscar impostos DAS pendentes do usuário
      const { data: pendingDAS, error } = await supabase
        .from('imposto_das')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'Pendente')
        .gte('vencimento', now.toISOString().split('T')[0]);
      
      if (error) {
        console.error('Erro ao buscar DAS pendentes:', error);
      } else if (pendingDAS && pendingDAS.length > 0) {
        for (const das of pendingDAS) {
          const vencimento = new Date(das.vencimento + 'T00:00:00');
          const daysUntilDue = Math.ceil((vencimento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 10 && daysUntilDue >= 0) {
            const message = daysUntilDue === 0 
              ? `⚠️ URGENTE: DAS vence HOJE (${vencimento.toLocaleDateString('pt-BR')}) - Competência ${das.competencia}`
              : `🔔 DAS vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''} (${vencimento.toLocaleDateString('pt-BR')}) - Competência ${das.competencia}`;
            
            automaticNotifications.push({
              id: Date.now() + Math.random() + das.id,
              message,
              date: formatDate(now),
              created_at: new Date().toISOString(),
              read: false,
              type: 'das_alert',
              priority: daysUntilDue <= 3 ? 'high' : 'medium'
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar DAS pendentes:', error);
    }
    
    // Adicionar notificação de boas-vindas
    automaticNotifications.push(
      { 
        id: 1, 
        message: 'Bem-vindo ao FinManage MEI!', 
        date: formatDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)), 
        created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        type: 'welcome',
        priority: 'low'
      },
      { 
        id: 2, 
        message: 'Seu relatório mensal está pronto', 
        date: formatDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)), 
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        type: 'info',
        priority: 'medium'
      }
    );
    
    if (automaticNotifications.length > 0) {
      localStorage.setItem('mei_notifications', JSON.stringify(automaticNotifications));
    }
  };



  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('mei_notifications', JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('mei_notifications', JSON.stringify(updatedNotifications));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
  const hasHighPriorityUnread = notifications.some(n => !n.read && (n.type === 'das_alert' || n.priority === 'high'));
  
  // Filtrar notificações baseado no estado do filtro
  const displayNotifications = showOnlyUnread 
    ? notifications.filter(n => !n.read)
    : notifications;
    
  const getNotificationIcon = (notification: any) => {
    if (notification.type === 'das_alert' || notification.priority === 'high') {
      return <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />;
    }
    if (notification.type === 'das_reminder') {
      return <BellRing className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />;
    }
    return <BellRing className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />;
  };
  
  const getNotificationStyle = (notification: any) => {
    if (!notification.read) {
      if (notification.type === 'das_alert' || notification.priority === 'high') {
        return 'bg-red-50 border-l-4 border-red-500';
      }
      if (notification.type === 'das_reminder') {
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      }
      return 'bg-emerald-50 border-l-4 border-emerald-500';
    }
    return 'bg-white';
  };
  
  const getMessageStyle = (notification: any) => {
    if (notification.type === 'das_alert' || notification.priority === 'high') {
      return 'font-semibold text-red-700';
    }
    if (notification.type === 'das_reminder') {
      return 'font-medium text-yellow-700';
    }
    return notification.read ? 'text-gray-600' : 'font-medium text-gray-900';
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BellRing className={`h-8 w-8 ${hasHighPriorityUnread ? 'text-red-500 animate-pulse' : 'text-emerald-600'}`} />
            <h1 className="text-2xl font-bold text-emerald-800">Notificações</h1>
            {unreadCount > 0 && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                hasHighPriorityUnread ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={showOnlyUnread ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Filter className="h-4 w-4" />
              {showOnlyUnread ? 'Mostrar todas' : 'Apenas não lidas'}
            </Button>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center gap-2"
                title="Marcar todas como lidas"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {displayNotifications.length > 0 ? (
            displayNotifications
              .sort((a, b) => {
                // Ordenar por prioridade e depois por data
                const getPriority = (notif: any) => {
                  if (notif.type === 'das_alert' || notif.priority === 'high') return 3;
                  if (notif.type === 'das_reminder') return 2;
                  return 1;
                };
                
                const aPriority = getPriority(a);
                const bPriority = getPriority(b);
                
                if (aPriority !== bPriority) {
                  return bPriority - aPriority;
                }
                
                return new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime();
              })
              .map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg transition-all duration-200 ${getNotificationStyle(notification)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start flex-1">
                    {getNotificationIcon(notification)}
                    <div className="flex-1">
                      <p className={`text-sm ${getMessageStyle(notification)}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.created_at || notification.date)}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsRead(notification.id)}
                      className="h-8 px-2 ml-2 flex-shrink-0"
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
              <BellRing className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">
                {showOnlyUnread ? 'Nenhuma notificação não lida' : 'Nenhuma notificação disponível'}
              </p>
              <p className="text-sm">
                {showOnlyUnread 
                  ? 'Todas as suas notificações foram lidas!' 
                  : 'Você receberá notificações importantes aqui.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;