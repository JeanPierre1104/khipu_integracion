import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.text();
        console.log('Notificación de Khipu recibida:', body);
        
        // Aquí procesas la notificación de Khipu
        // Por ahora solo la loggeamos
        
        return NextResponse.json({ status: 'received' });
    } catch (error) {
        console.error('Error procesando notificación:', error);
        return NextResponse.json(
            { error: 'Error procesando notificación' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ status: 'Notify endpoint active' });
}
