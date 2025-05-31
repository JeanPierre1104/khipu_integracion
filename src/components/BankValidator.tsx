'use client';

import { useState, useEffect } from 'react';

interface Bank {
  bank_id: string;
  name: string;
  message: string;
  min_amount?: number;
  max_amount?: number;
  type: string;
  parent?: string;
  recommended?: boolean;
}

interface BankValidatorProps {
  amount: number;
  onValidBanksChange?: (banks: Bank[]) => void;
}

export default function BankValidator({ amount, onValidBanksChange }: BankValidatorProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validBanks, setValidBanks] = useState<Bank[]>([]);

  useEffect(() => {
    fetchBanks();
  }, []);  useEffect(() => {
    if (banks.length > 0 && amount > 0) {
      const valid = banks.filter(bank => 
        amount >= (bank.min_amount || 0) && 
        amount <= (bank.max_amount || 999999999)
      );
      setValidBanks(valid);
      onValidBanksChange?.(valid);
    }
  }, [banks, amount, onValidBanksChange]);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banks');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setBanks(data.banks || []);
      setError('');
    } catch (err) {
      console.error('Error fetching banks:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar bancos');
    } finally {
      setLoading(false);
    }  };

  const getBankTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bank': return '🏦';
      case 'prepaid': return '💳';
      case 'credit': return '💳';
      default: return '🏛️';
    }
  };

  const getBankTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bank': return 'bg-blue-100 text-blue-800';
      case 'prepaid': return 'bg-green-100 text-green-800';
      case 'credit': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Cargando bancos disponibles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-red-600">❌</span>
          <span className="text-sm text-red-700">{error}</span>
          <button 
            onClick={fetchBanks}
            className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Resumen específico para DemoBank */}
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {banks.length === 1 && banks[0]?.bank_id === 'demobank' 
                ? 'Entorno de Pruebas - DemoBank' 
                : 'Bancos Disponibles'
              }
            </h3>
            <p className="text-sm text-gray-600">
              {amount > 0 ? (
                <>
                  {banks.length === 1 && banks[0]?.bank_id === 'demobank' 
                    ? `Monto de prueba: $${amount.toLocaleString()} CLP (Límite: $5.000 CLP)`
                    : `Para monto: $${amount.toLocaleString()} CLP`
                  }
                </>
              ) : (
                banks.length === 1 && banks[0]?.bank_id === 'demobank'
                  ? 'Configurado para pruebas técnicas de Khipu - Mercado chileno'
                  : 'Ingrese un monto para ver bancos compatibles'
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {amount > 0 ? validBanks.length : banks.length}
            </div>
            <div className="text-xs text-gray-500">
              {banks.length === 1 ? 'DemoBank' : (amount > 0 ? 'Compatible(s)' : 'Total')}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de bancos */}
      {amount > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">            <h4 className="text-sm font-medium text-gray-900">
              {banks.length === 1 && banks[0]?.bank_id === 'demobank' 
                ? `✅ DemoBank - Configurado para Pruebas`
                : `Bancos Compatibles (${validBanks.length})`
              }
            </h4>
          </div>
          
          {validBanks.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">🚫</div>              <p className="text-gray-600">
                {banks.length === 1 && banks[0]?.bank_id === 'demobank'
                  ? `Monto fuera del rango de DemoBank`
                  : 'No hay bancos disponibles para este monto'
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {banks.length === 1 && banks[0]?.bank_id === 'demobank'
                  ? `Rango permitido: $100 - $5.000 CLP`
                  : `Monto mínimo requerido: $${banks.length > 0 ? Math.min(...banks.map(b => b.min_amount || 0)).toLocaleString() : '0'} CLP`
                }
              </p>
            </div>
          ) : (            <div className="divide-y divide-gray-200">
              {validBanks.map((bank) => (
                <div key={bank.bank_id} className={`p-4 hover:bg-gray-50 transition-colors ${bank.recommended ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getBankTypeIcon(bank.type)}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-gray-900">{bank.name}</h5>
                          {bank.recommended && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              ⭐ Recomendado
                            </span>
                          )}
                        </div>
                        {bank.message && (
                          <p className="text-sm text-gray-600">{bank.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBankTypeColor(bank.type)}`}>
                        {bank.type}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Rango</div>
                        <div className="text-sm font-medium text-gray-900">
                          ${(bank.min_amount || 0).toLocaleString()} - ${(bank.max_amount || 999999).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mostrar todos los bancos cuando no hay monto */}
      {amount <= 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900">
              Todos los Bancos Disponibles ({banks.length})
            </h4>
          </div>
          
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-200">
            {banks.map((bank) => (
              <div key={bank.bank_id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getBankTypeIcon(bank.type)}</span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{bank.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getBankTypeColor(bank.type)}`}>
                      {bank.type}
                    </span>                    <span className="text-xs text-gray-500">
                      ${(bank.min_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}      {/* Consejos específicos para DemoBank */}
      {amount > 0 && validBanks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 text-sm">💡</span>
            <div className="text-sm text-blue-700">
              <p className="font-medium">
                {banks.length === 1 && banks[0]?.bank_id === 'demobank' 
                  ? 'Entorno de Pruebas Configurado:' 
                  : 'Consejo:'
                }
              </p>
              <p>
                {banks.length === 1 && banks[0]?.bank_id === 'demobank' 
                  ? 'DemoBank está configurado para el mercado chileno con límite de $5.000 CLP según los requisitos de la prueba técnica de Khipu.'
                  : `Tienes ${validBanks.length} opciones disponibles. Los bancos con montos mínimos más bajos ofrecen mayor flexibilidad.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
