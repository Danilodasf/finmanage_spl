import React, { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { useNavigate } from 'react-router-dom';

export interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'Seu relatório mensal está pronto', date: '2023-10-15', read: false },
    { id: 2, message: 'Lembrete: Pagamento de imposto DAS até dia 20', date: '2023-10-14', read: false },
    { id: 3, message: 'Nova funcionalidade disponível: Exportação de relatórios', date: '2023-10-10', read: true },
    { id: 4, message: 'Dica: Categorize suas despesas para melhor controle', date: '2023-10-05', read: true },
    { id: 5, message: 'Bem-vindo ao FinManage MEI!', date: '2023-10-01', read: true },
  ]);
  
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
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
    navigate('/notifications');
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full"
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notificações</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead} 
              className="text-xs h-8"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-auto">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 ${notification.read ? 'bg-white' : 'bg-emerald-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm">{notification.message}</p>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)} 
                        className="h-6 w-6 p-0"
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Marcar como lida</span>
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(notification.date)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Nenhuma notificação</p>
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