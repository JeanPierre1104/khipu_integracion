'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DiagnosticsPage() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/diagnostics');
        
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setDiagnosticData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al obtener diagnósticos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🔧 Diagnóstico de Khipu
            </h1>
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
          <p className="text-gray-600">
            Esta página muestra el estado actual de la integración con Khipu para ayudar a resolver problemas.
          </p>
        </header>

        {/* Content */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p>{error}</p>
            </div>
          ) : diagnosticData ? (
            <div className="space-y-8">
              {/* Timestamp */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Diagnóstico ejecutado: {new Date(diagnosticData.timestamp).toLocaleString()}
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {diagnosticData.environment}
                </span>
              </div>

              {/* Variables de entorno */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Variables de Entorno</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <ul className="space-y-2">
                    {Object.entries(diagnosticData.environment_variables).map(([key, value]) => (
                      <li key={key} className="flex justify-between">
                        <span className="font-mono text-sm">{key}</span>
                        <span className="font-mono text-sm">{value as string}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Diagnóstico Khipu V3 */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Khipu API v3 
                  <span className={`ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full
                    ${diagnosticData.khipu_v3_diagnostics.status === 'connected' ? 'bg-green-100 text-green-800' : 
                      diagnosticData.khipu_v3_diagnostics.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}
                  >
                    {diagnosticData.khipu_v3_diagnostics.status}
                  </span>
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="mb-2">{diagnosticData.khipu_v3_diagnostics.message}</p>
                  {diagnosticData.khipu_v3_diagnostics.details && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold mb-2">Detalles:</h3>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(diagnosticData.khipu_v3_diagnostics.details, null, 2)}
                      </pre>
                      <button 
                        onClick={() => copyToClipboard(JSON.stringify(diagnosticData.khipu_v3_diagnostics.details, null, 2))}
                        className="mt-2 text-blue-600 text-xs hover:text-blue-800"
                      >
                        Copiar detalles
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnóstico Khipu V2 */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  Khipu API v2
                  <span className={`ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full
                    ${diagnosticData.khipu_v2_diagnostics.status === 'connected' ? 'bg-green-100 text-green-800' : 
                      diagnosticData.khipu_v2_diagnostics.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}
                  >
                    {diagnosticData.khipu_v2_diagnostics.status}
                  </span>
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="mb-2">{diagnosticData.khipu_v2_diagnostics.message}</p>
                </div>
              </div>

              {/* JSON completo */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Datos Completos</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(diagnosticData, null, 2)}
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(diagnosticData, null, 2))}
                    className="mt-2 text-blue-600 text-xs hover:text-blue-800"
                  >
                    Copiar diagnóstico completo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p>No hay datos disponibles</p>
          )}
        </div>

        {/* Guía de resolución de problemas */}
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Guía de resolución de problemas</h2>
          
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <h3 className="font-medium text-yellow-800">Variables de entorno faltantes</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Si ves ❌ en alguna variable de entorno, necesitas configurarla en tu archivo .env.local
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h3 className="font-medium text-blue-800">Integración con API v3</h3>
              <p className="text-sm text-blue-700 mt-1">
                La API v3 requiere las credenciales correctas de KHIPU_API_KEY y KHIPU_SECRET_KEY.
                Verifica que estén correctamente configuradas.
              </p>
            </div>
            
            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <h3 className="font-medium text-green-800">Solución para DemoBank</h3>
              <p className="text-sm text-green-700 mt-1">
                Para el entorno de pruebas con DemoBank en Chile, asegúrate de:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Limitar los montos a máximo 5.000 CLP</li>
                  <li>Usar la moneda 'CLP' en todas las transacciones</li>
                  <li>Configurar correctamente las URLs de retorno</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
