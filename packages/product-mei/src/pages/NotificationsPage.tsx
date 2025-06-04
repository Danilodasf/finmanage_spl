import React, { useState } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Button } from '../components/ui/button';
import { Check } from 'lucide-react';
import { Notification } from '../components/ui/notification';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'Seu relatório mensal está pronto', date: '2023-10-15', read: false },
    { id: 2, message: 'Lembrete: Pagamento de imposto DAS até dia 20', date: '2023-10-14', read: false },
    { id: 3, message: 'Nova funcionalidade disponível: Exportação de relatórios', date: '2023-10-10', read: true },
    { id: 4, message: 'Dica: Categorize suas despesas para melhor controle', date: '2023-10-05', read: true },
    { id: 5, message: 'Bem-vindo ao FinManage MEI!', date: '2023-10-01', read: true },
    { id: 6, message: 'Seu faturamento mensal aumentou 15% em relação ao mês anterior', date: '2023-09-30', read: true },
    { id: 7, message: 'Lembrete: Atualize seus dados cadastrais', date: '2023-09-25', read: true },
    { id: 8, message: 'Dica: Configure alertas para lembretes de pagamentos', date: '2023-09-20', read: true },
    { id: 9, message: 'Nova parceria disponível: Desconto em serviços contábeis', date: '2023-09-15', read: true },
    { id: 10, message: 'Seu limite de faturamento anual está em 65%', date: '2023-09-10', read: true },
  ]);

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