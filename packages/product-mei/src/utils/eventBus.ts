/**
 * Sistema de eventos para comunicação entre componentes
 * Permite que diferentes telas se comuniquem quando há mudanças nos dados
 */

type EventCallback = (data?: any) => void;

class EventBus {
  private events: { [key: string]: EventCallback[] } = {};

  /**
   * Registra um listener para um evento
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Remove um listener de um evento
   */
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Dispara um evento para todos os listeners
   */
  emit(event: string, data?: any): void {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro ao executar callback do evento ${event}:`, error);
      }
    });
  }

  /**
   * Remove todos os listeners de um evento
   */
  removeAllListeners(event: string): void {
    delete this.events[event];
  }

  /**
   * Remove todos os listeners de todos os eventos
   */
  clear(): void {
    this.events = {};
  }
}

// Instância singleton do EventBus
export const eventBus = new EventBus();

// Eventos específicos da aplicação
export const EVENTS = {
  TRANSACTION_UPDATED: 'transaction:updated',
  TRANSACTION_DELETED: 'transaction:deleted',
  TRANSACTION_CREATED: 'transaction:created',
  DAS_UPDATED: 'das:updated',
  DAS_DELETED: 'das:deleted',
  DAS_CREATED: 'das:created',
  DATA_REFRESH_NEEDED: 'data:refresh_needed'
} as const;

export type EventType = typeof EVENTS[keyof typeof EVENTS];