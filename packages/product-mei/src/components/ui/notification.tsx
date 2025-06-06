import React, { useState, useEffect } from 'react';
import { BellRing, Check, AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { useNavigate } from 'react-router-dom';
import { getNextDASDate, formatDASDate, getDaysUntilDAS } from '../../utils/dasDateUtils';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

export interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
  type?: 'info' | 'warning' | 'tax' | 'welcome';
  priority?: 'high' | 'medium' | 'low';
}

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Tentar carregar notificações do localStorage
    const savedNotifications = localStorage.getItem('mei_notifications');
    if (savedNotifications) {
      try {
        return JSON.parse(savedNotifications);
      } catch (error) {
        console.error('Erro ao carregar notificações do localStorage:', error);
      }
    }
    
    return [];
  });
  
  // Função para gerar notificações automáticas baseadas em dados reais do banco
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
        .gte('vencimento', now.toISOString().split('T')[0]); // Apenas vencimentos futuros ou hoje
      
      if (error) {
        console.error('Erro ao buscar DAS pendentes:', error);
      } else if (pendingDAS && pendingDAS.length > 0) {
        // Verificar cada DAS pendente
        for (const das of pendingDAS) {
          const vencimento = new Date(das.vencimento + 'T00:00:00'); // Adicionar horário para evitar problemas de timezone
          const daysUntilDue = Math.ceil((vencimento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          // Criar alerta se faltam 10 dias ou menos
          if (daysUntilDue <= 10 && daysUntilDue >= 0) {
            const alertKey = `das_${das.id}_${das.vencimento}`;
            
            // Verificar se já existe uma notificação para este DAS específico
            const taxNotificationExists = notifications.some(n => 
              n.type === 'tax' && 
              n.message.includes(das.competencia) &&
              n.message.includes(vencimento.toLocaleDateString('pt-BR'))
            );
            
            if (!taxNotificationExists) {
              const message = daysUntilDue === 0 
                ? `⚠️ URGENTE: DAS vence HOJE (${vencimento.toLocaleDateString('pt-BR')}) - Competência ${das.competencia}`
                : `🔔 DAS vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''} (${vencimento.toLocaleDateString('pt-BR')}) - Competência ${das.competencia}`;
              
              automaticNotifications.push({
                id: Date.now() + Math.random() + das.id,
                message,
                date: formatDate(now),
                read: false,
                type: 'tax',
                priority: daysUntilDue <= 3 ? 'high' : 'medium'
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar DAS pendentes:', error);
    }
    
    // Adicionar notificação de boas-vindas se não existir
    const hasWelcomeNotification = notifications.some(n => n.type === 'welcome');
    if (!hasWelcomeNotification && notifications.length === 0) {
      automaticNotifications.push(
        { 
          id: 1, 
          message: 'Bem-vindo ao FinManage MEI!', 
          date: formatDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)), 
          read: false,
          type: 'welcome',
          priority: 'low'
        },
        { 
          id: 2, 
          message: 'Seu relatório mensal está pronto', 
          date: formatDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)), 
          read: false,
          type: 'info',
          priority: 'medium'
        },
        { 
          id: 3, 
          message: 'Nova funcionalidade disponível: Exportação de relatórios', 
          date: formatDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)), 
          read: true,
          type: 'info',
          priority: 'low'
        },
        { 
          id: 4, 
          message: 'Dica: Categorize suas despesas para melhor controle', 
          date: formatDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)), 
          read: true,
          type: 'info',
          priority: 'low'
        }
      );
    }
    
    if (automaticNotifications.length > 0) {
      const updatedNotifications = [...notifications, ...automaticNotifications];
      setNotifications(updatedNotifications);
      localStorage.setItem('mei_notifications', JSON.stringify(updatedNotifications));
    }
  };
  
  // Verificar notificações automáticas ao carregar o componente
  useEffect(() => {
    if (user) {
      generateAutomaticNotifications();
    }
  }, [user]);
  
  const [open, setOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const hasHighPriorityUnread = notifications.some(n => !n.read && n.priority === 'high');
  
  // Filtrar notificações para exibição no popover (apenas não lidas por padrão)
  const displayNotifications = showAllNotifications 
    ? notifications 
    : notifications.filter(n => !n.read);
  
  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    // Salvar no localStorage
    localStorage.setItem('mei_notifications', JSON.stringify(updatedNotifications));
    
    // Se estamos mostrando apenas não lidas e não há mais não lidas, fechar o popover
    if (!showAllNotifications && updatedNotifications.filter(n => !n.read).length === 0) {
      setOpen(false);
    }
  };
  
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    // Salvar no localStorage
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

  const handleViewAll = () => {
    setOpen(false);
    setShowAllNotifications(false); // Reset para o estado padrão
    navigate('/notifications');
  };
  
  const toggleShowAll = () => {
    setShowAllNotifications(!showAllNotifications);
  };
  
  const getNotificationIcon = (notification: Notification) => {
    if (notification.type === 'tax' || notification.priority === 'high') {
      return <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />;
    }
    return null;
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative ${hasHighPriorityUnread ? 'animate-pulse' : ''}`}
          aria-label="Notificações"
        >
          <BellRing className={`h-5 w-5 ${hasHighPriorityUnread ? 'text-red-500' : ''}`} />
          {unreadCount > 0 && (
            <span 
              className={`absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center text-white text-xs rounded-full ${
                hasHighPriorityUnread ? 'bg-red-600 animate-pulse' : 'bg-red-500'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notificações</h3>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleShowAll} 
              className="text-xs h-8"
            >
              {showAllNotifications ? 'Apenas não lidas' : 'Ver todas'}
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead} 
                className="text-xs h-8"
                title="Marcar todas como lidas"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto">
          {displayNotifications.length > 0 ? (
            <div className="divide-y">
              {displayNotifications
                .sort((a, b) => {
                  // Ordenar por prioridade e depois por data
                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                  const aPriority = priorityOrder[a.priority || 'low'];
                  const bPriority = priorityOrder[b.priority || 'low'];
                  
                  if (aPriority !== bPriority) {
                    return bPriority - aPriority;
                  }
                  
                  return new Date(b.date).getTime() - new Date(a.date).getTime();
                })
                .map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 ${
                    notification.read 
                      ? 'bg-white' 
                      : notification.priority === 'high' 
                        ? 'bg-red-50 border-l-4 border-red-500' 
                        : 'bg-emerald-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start flex-1">
                      {getNotificationIcon(notification)}
                      <p className={`text-sm ${
                        notification.priority === 'high' ? 'font-semibold text-red-700' : ''
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)} 
                        className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Marcar como lida</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">{formatDate(notification.date)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>{showAllNotifications ? 'Nenhuma notificação' : 'Nenhuma notificação não lida'}</p>
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button 
            variant="outline" 
            className="w-full text-sm" 
            onClick={handleViewAll}
          >
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};