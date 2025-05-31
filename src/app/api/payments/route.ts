import { NextRequest, NextResponse } from 'next/server';
import { createKhipuPayment } from '@/services/khipu.service';
import { DemoBankMockService } from '@/services/demobank-mock.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { amount, currency, subject } = body;
    if (!amount || !currency || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, subject' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validaciones específicas para DemoBank (reto técnico)
    if (amount < 100) {
      return NextResponse.json(
        { error: 'Monto mínimo para DemoBank: $100 CLP' },
        { status: 400 }
      );
    }

    if (amount > 5000) {
      return NextResponse.json(
        { error: 'Monto máximo para DemoBank: $5.000 CLP (límite de prueba técnica)' },
        { status: 400 }
      );
    }    // Create payment using Khipu v3 API
    const paymentData = {
      amount,
      currency: currency.toUpperCase(),
      subject,
      ...(body.body && { body: body.body }),
      ...(body.payer_email && { payer_email: body.payer_email }),      return_url: body.return_url || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      cancel_url: body.cancel_url || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancelled`,
      // No incluir notify_url para localhost - Khipu no lo acepta
      // notify_url: body.notify_url || `${process.env.NEXT_PUBLIC_BASE_URL}/api/notify`,
      ...(body.custom && { custom: body.custom }),
      transaction_id: body.transaction_id || `tx_${Date.now()}`,
      // Solo incluir campos opcionales si tienen valor
      ...(body.bank_id && { bank_id: body.bank_id }),
      ...(body.expires_date && { expires_date: body.expires_date }),    };

    console.log('🔧 Payment data being sent to Khipu:', {
      ...paymentData,
      return_url: paymentData.return_url,
      cancel_url: paymentData.cancel_url,
      base_url: process.env.NEXT_PUBLIC_BASE_URL
    });

    console.log('Creating payment with data:', paymentData);

    let paymentResponse;

    try {
      // Intentar con Khipu API real primero
      paymentResponse = await createKhipuPayment(paymentData);
      console.log('✅ Payment created with Khipu API:', paymentResponse);
      
    } catch (khipuError) {
      console.warn('⚠️ Khipu API failed, using DemoBank Mock Service:', khipuError);
      
      // Fallback a DemoBank Mock para demostración
      const mockService = new DemoBankMockService();
      paymentResponse = await mockService.createMockPayment({
        amount: paymentData.amount,
        currency: paymentData.currency,
        subject: paymentData.subject,
        payer_email: paymentData.payer_email,
        body: paymentData.body,
        transaction_id: paymentData.transaction_id
      });
      console.log('✅ Payment created with DemoBank Mock:', paymentResponse);
    }    return NextResponse.json({
      success: true,
      data: paymentResponse,
      provider: (paymentResponse?.payment_id?.startsWith('demo_')) ? 'DemoBank Mock' : 'Khipu API'
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
