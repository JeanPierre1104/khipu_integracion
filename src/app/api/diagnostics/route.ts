import { NextResponse } from 'next/server';
import { KhipuV3Service } from '../../../services/khipu-v3-signature';
import { KhipuService } from '../../../services/khipu';

// Definir tipo para resultados de diagnóstico
type DiagnosticResult = {
  status: string;
  message?: string;
  details?: Record<string, unknown>;
};

export async function GET() {
  try {
    console.log('🔍 Ejecutando diagnóstico de Khipu');
    
    // Verificar variables de entorno
    const envDiagnostics = {
      KHIPU_API_KEY: process.env.KHIPU_API_KEY ? '✅ Configurado' : '❌ No configurado',
      KHIPU_SECRET_KEY: process.env.KHIPU_SECRET_KEY ? '✅ Configurado' : '❌ No configurado',
      KHIPU_RECEIVER_ID: process.env.KHIPU_RECEIVER_ID ? '✅ Configurado' : '❌ No configurado',
      KHIPU_SECRET: process.env.KHIPU_SECRET ? '✅ Configurado' : '❌ No configurado',
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    };
    
    console.log('📋 Diagnóstico de variables de entorno:', envDiagnostics);
    
    // Intentar crear una instancia de cada servicio
    let khipuV3DiagResult: DiagnosticResult = { status: 'not_tested' };
    let khipuV2DiagResult: DiagnosticResult = { status: 'not_tested' };
    
    try {
      console.log('🔍 Probando KhipuV3Service...');
      const khipuV3Service = new KhipuV3Service();
      khipuV3DiagResult = { 
        status: 'instance_created',
        message: 'Instancia creada correctamente'
      };
    } catch (error) {
      console.error('❌ Error creando instancia de KhipuV3Service:', error);
      khipuV3DiagResult = { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
    
    try {
      console.log('🔍 Probando KhipuService...');
      const khipuService = new KhipuService();
      khipuV2DiagResult = { 
        status: 'instance_created',
        message: 'Instancia creada correctamente'
      };
    } catch (error) {
      console.error('❌ Error creando instancia de KhipuService:', error);
      khipuV2DiagResult = { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
    
    // Intentar test de conexión con V3 si la instancia se creó correctamente
    if (khipuV3DiagResult.status === 'instance_created') {
      try {
        console.log('🧪 Ejecutando test de conexión con V3...');
        const khipuV3Service = new KhipuV3Service();
        const testResult = await khipuV3Service.testConnection();
        // Convertir el resultado al formato de DiagnosticResult
        khipuV3DiagResult = {
          status: testResult.success ? 'connected' : 'connection_failed',
          message: testResult.message,
          details: testResult.details
        };
      } catch (error) {
        console.error('❌ Error en test de conexión V3:', error);
        khipuV3DiagResult = { 
          status: 'connection_error',
          message: error instanceof Error ? error.message : 'Error desconocido en test de conexión'
        };
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      environment_variables: envDiagnostics,
      khipu_v3_diagnostics: khipuV3DiagResult,
      khipu_v2_diagnostics: khipuV2DiagResult,
      message: 'Diagnóstico de Khipu completado'
    });
    
  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 