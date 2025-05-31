'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import KhipuWebPaymentForm from '@/components/KhipuWebPaymentForm';
import Link from 'next/link';

export default function Home() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<{
    type: 'success' | 'cancelled' | null;
    paymentId?: string;
    message?: string;
  }>({ type: null });

  useEffect(() => {
    const payment = searchParams.get('payment');
    const paymentId = searchParams.get('payment_id');
    
    if (payment === 'success') {
      setPaymentStatus({
        type: 'success',
        paymentId: paymentId || undefined,
        message: paymentId?.startsWith('demo_') 
          ? 'Pago de prueba DemoBank completado exitosamente'
          : 'Pago procesado exitosamente con Khipu'
      });
    } else if (payment === 'cancelled') {
      setPaymentStatus({
        type: 'cancelled',
        paymentId: paymentId || undefined,
        message: 'El pago fue cancelado por el usuario'
      });
    }
  }, [searchParams]);

  const clearPaymentStatus = () => {
    setPaymentStatus({ type: null });
    // Limpiar los parámetros de la URL
    window.history.replaceState({}, '', '/');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 Khipu Pro Integration
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                v2.0 Advanced
              </span>
            </div>
            <nav className="flex space-x-4">
              <Link 
                href="/diagnostics" 
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔧 Diagnósticos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Notificación de estado del pago */}
          {paymentStatus.type && (
            <div className={`mb-8 p-6 rounded-lg border-l-4 ${
              paymentStatus.type === 'success' 
                ? 'bg-green-50 border-green-400 text-green-700' 
                : 'bg-yellow-50 border-yellow-400 text-yellow-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {paymentStatus.type === 'success' ? '✅' : '⚠️'}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium mb-1">
                      {paymentStatus.type === 'success' ? 'Pago Exitoso' : 'Pago Cancelado'}
                    </h3>
                    <p className="text-sm">
                      {paymentStatus.message}
                    </p>
                    {paymentStatus.paymentId && (
                      <p className="text-xs mt-1 opacity-75">
                        ID de pago: {paymentStatus.paymentId}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={clearPaymentStatus}
                  className="ml-4 px-3 py-1 text-xs bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>
          )}
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Integración Avanzada con Khipu
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Implementación con redirección directa y API v3 de Khipu
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">🔄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Redirección Directa
                </h3>
                <p className="text-gray-600 text-sm">
                  Flujo sin SDK con redirección automática a Khipu
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  API v3 Segura
                </h3>
                <p className="text-gray-600 text-sm">
                  Autenticación x-signature con HMAC-SHA256
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  API v3 Segura
                </h3>
                <p className="text-gray-600 text-sm">
                  Integración con la última versión de Khipu API
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <KhipuWebPaymentForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              💻 Desarrollado con Next.js 15, TypeScript y Tailwind CSS
            </p>
            <p className="text-sm">
              🎯 Diferenciación: Redirección Directa + Validación de Bancos + API v3
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
