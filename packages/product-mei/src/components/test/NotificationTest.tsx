import React from 'react';
import { getNextDASDate, formatDASDate, getDaysUntilDAS, getNextMonthCompetencia } from '../../utils/dasDateUtils';

/**
 * Componente de teste para verificar os cálculos de data do DAS
 * Este componente pode ser temporariamente adicionado a uma página para verificar se os cálculos estão corretos
 */
export const NotificationTest: React.FC = () => {
  const now = new Date();
  const nextDASDate = getNextDASDate(now);
  const daysUntilDAS = getDaysUntilDAS(nextDASDate, now);
  const nextMonthCompetencia = getNextMonthCompetencia(now);
  
  // Teste com diferentes datas para verificar a lógica
  const testDates = [
    new Date(2024, 0, 15), // 15 de janeiro
    new Date(2024, 0, 20), // 20 de janeiro
    new Date(2024, 0, 25), // 25 de janeiro
    new Date(2024, 11, 15), // 15 de dezembro
    new Date(2024, 11, 25), // 25 de dezembro
  ];
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Teste de Cálculos de Data DAS</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Data Atual:</h4>
        <p>Hoje: {now.toLocaleDateString('pt-BR')}</p>
        <p>Próximo vencimento DAS: {formatDASDate(nextDASDate)}</p>
        <p>Dias até vencimento: {daysUntilDAS}</p>
        <p>Competência próximo mês: {nextMonthCompetencia}</p>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2">Testes com Diferentes Datas:</h4>
        {testDates.map((testDate, index) => {
          const testNextDAS = getNextDASDate(testDate);
          const testDaysUntil = getDaysUntilDAS(testNextDAS, testDate);
          const testNextMonth = getNextMonthCompetencia(testDate);
          
          return (
            <div key={index} className="mb-2 p-2 bg-white rounded">
              <p><strong>Data teste:</strong> {testDate.toLocaleDateString('pt-BR')}</p>
              <p><strong>Próximo DAS:</strong> {formatDASDate(testNextDAS)}</p>
              <p><strong>Dias até:</strong> {testDaysUntil}</p>
              <p><strong>Próximo mês:</strong> {testNextMonth}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};