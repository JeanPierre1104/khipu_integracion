import { NextResponse } from 'next/server';
import { KhipuService } from '../../../services/khipu';

export async function GET() {
    try {
        console.log('🧪 Iniciando test de Khipu...');
        
        const khipuService = new KhipuService();
        
        // Primero probar endpoint simple de bancos
        console.log('📋 Probando endpoint de bancos...');
        const banks = await khipuService.getBanks();
        
        console.log('✅ Test de bancos exitoso');
        
        // Luego probar creación de pago
        console.log('💳 Probando creación de pago...');
        const testPayment = await khipuService.createPayment({
            amount: 1000,
            currency: 'CLP',
            subject: 'Pago de Prueba - Integración Khipu',
            body: 'Este es un pago de prueba para verificar la integración con la API de Khipu',
            transaction_id: `test_${Date.now()}`,
            payer_email: 'test@example.com'
        });
        
        console.log('✅ Test de pago exitoso');
        
        return NextResponse.json({
            success: true,
            message: 'Conexión exitosa con Khipu - Todos los tests pasaron',
            results: {
                banks: {
                    success: true,
                    count: banks.banks?.length || 0
                },
                payment: {
                    success: true,
                    payment_id: testPayment.payment_id,
                    payment_url: testPayment.payment_url
                }
            }
        });
    } catch (error: unknown) {
        console.error('❌ Error en test:', error);
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
