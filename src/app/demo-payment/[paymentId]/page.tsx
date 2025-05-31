/**
 * Página de simulación del portal de pagos DemoBank
 * Esta página simula la experiencia de pago cuando Khipu no está disponible
 */
'use client';

import { useEffect, useState } from 'react';

export default function DemoBankPaymentPortal() {
  const [paymentData, setPaymentData] = useState<{
    payment_id: string;
    amount: number;
    currency: string;
    subject: string;
    merchant: string;
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Extraer el payment_id de la URL
    const pathSegments = window.location.pathname.split('/');
    const paymentId = pathSegments[pathSegments.length - 1];
    
    // Simular datos del pago (en un escenario real, esto vendría de una API)
    setPaymentData({
      payment_id: paymentId,
      amount: 1500,
      currency: 'CLP',
      subject: 'Pago de prueba DemoBank',
      merchant: 'Prueba Técnica Khipu'
    });
  }, []);

  const handlePayment = async (success: boolean) => {
    setProcessing(true);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    
    if (success) {
      window.location.href = `${baseUrl}/payment/success?payment_id=${paymentData?.payment_id}&amount=${paymentData?.amount}`;
    } else {
      window.location.href = `${baseUrl}/payment/cancelled?payment_id=${paymentData?.payment_id}&reason=user_cancelled`;
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando portal de pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header simulando Khipu */}
      <div className="bg-blue-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center">
          <div className="bg-white text-blue-600 px-3 py-1 rounded font-bold text-lg mr-4">
            DemoBank
          </div>
          <div>
            <h1 className="text-xl font-semibold">Portal de Pagos - Simulación</h1>
            <p className="text-blue-100 text-sm">Prueba Técnica - Integración Khipu</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-6">
        {/* Información del pago */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirmar Pago</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <span className="text-gray-600">Comercio:</span>
              <span className="font-semibold">{paymentData.merchant}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <span className="text-gray-600">Concepto:</span>
              <span className="font-semibold">{paymentData.subject}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <span className="text-gray-600">Monto a pagar:</span>
              <span className="text-2xl font-bold text-green-600">
                ${paymentData.amount?.toLocaleString()} {paymentData.currency}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <span className="text-gray-600">ID de Pago:</span>
              <span className="font-mono text-sm">{paymentData.payment_id}</span>
            </div>
          </div>
        </div>

        {/* Simulación de banco */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Simular Respuesta del Banco</h3>
          <p className="text-gray-600 mb-6">
            En un entorno real, aquí estarían los métodos de pago del banco.
            Para la demostración, puedes simular el resultado:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handlePayment(true)}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Procesando...
                </>
              ) : (
                <>
                  ✅ Simular Pago Exitoso
                </>
              )}
            </button>
            
            <button
              onClick={() => handlePayment(false)}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              ❌ Simular Pago Cancelado
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-blue-800 mb-2">🧪 Modo Demostración</h4>
          <p className="text-blue-700 text-sm">
            Esta es una simulación del portal de pagos de DemoBank. En producción, 
            esta página sería proporcionada por Khipu y el banco real.
          </p>
        </div>
      </div>
    </div>
  );
}
