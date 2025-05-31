import { NextResponse } from 'next/server';

export async function GET() {
    try {        // Configuración específica para la prueba técnica de Khipu
        // REQUISITO: Solo DemoBank con límite de $5.000 CLP según especificaciones del reto
        const banks = [
            {
                bank_id: 'demobank',
                name: 'DemoBank',
                message: 'Banco oficial para pruebas técnicas de Khipu - Mercado chileno',
                min_amount: 100,
                max_amount: 5000, // Límite específico de la prueba técnica
                type: 'demo',
                recommended: true,
                description: 'Entorno de pruebas oficial de Khipu para el mercado chileno con límite de $5.000 CLP'
            }
        ];
        
        return NextResponse.json({ banks });    } catch (error: unknown) {
        console.error('Error al obtener bancos:', error);
        return NextResponse.json(
            { error: 'Error al obtener la lista de bancos' },
            { status: 500 }
        );
    }
}