/**
 * Servicio Mock para DemoBank - Prueba Técnica Khipu
 * 
 * Este servicio simula la creación de pagos para DemoBank cuando hay problemas
 * de conectividad con la API real de Khipu, permitiendo demostrar el flujo completo
 * 
 * SOLO PARA FINES DE DEMOSTRACIÓN TÉCNICA
 */

export interface MockPaymentRequest {
  amount: number;
  currency: string;
  subject: string;
  payer_email?: string;
  body?: string;
  transaction_id?: string;
}

export interface MockPaymentResponse {
  payment_id: string;
  payment_url: string;
  simplified_transfer_url: string;
  transfer_url: string;
  app_url: string;
  ready_for_terminal: boolean;
  status: string;
  message: string;
}

export class DemoBankMockService {
  
  /**
   * Simula la creación de un pago para DemoBank
   * Valida los límites específicos del reto técnico ($100-$5000 CLP)
   */
  public async createMockPayment(paymentData: MockPaymentRequest): Promise<MockPaymentResponse> {
    console.log('🧪 [DemoBank Mock] Simulando pago:', paymentData);
    
    // Validaciones específicas para DemoBank
    if (paymentData.amount < 100) {
      throw new Error('Monto mínimo para DemoBank: $100 CLP');
    }
    
    if (paymentData.amount > 5000) {
      throw new Error('Monto máximo para DemoBank: $5.000 CLP');
    }
    
    if (paymentData.currency !== 'CLP') {
      throw new Error('DemoBank solo acepta CLP (Pesos Chilenos)');
    }
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generar respuesta mock que simula DemoBank
    const paymentId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    
    const mockResponse: MockPaymentResponse = {
      payment_id: paymentId,
      payment_url: `https://payment.khipu.com/bank/demo/${paymentId}`,
      simplified_transfer_url: `https://payment.khipu.com/demo-simple/${paymentId}`,
      transfer_url: `https://payment.khipu.com/demo-transfer/${paymentId}`,
      app_url: `khipu://payment/${paymentId}`,
      ready_for_terminal: true,
      status: 'pending',
      message: `Pago DemoBank creado exitosamente por $${paymentData.amount.toLocaleString()} CLP`
    };
    
    console.log('✅ [DemoBank Mock] Pago simulado creado:', mockResponse);
    
    return mockResponse;
  }
  
  /**
   * Simula información de un pago DemoBank
   */
  public async getMockPayment(paymentId: string) {
    console.log('🔍 [DemoBank Mock] Consultando pago:', paymentId);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      payment_id: paymentId,
      status: 'pending',
      amount: 1500,
      currency: 'CLP',
      subject: 'Pago DemoBank Mock',
      bank: 'DemoBank',
      bank_id: 'demobank',
      created_date: new Date().toISOString(),
      message: 'Pago simulado para prueba técnica'
    };
  }
  
  /**
   * Verifica si debemos usar el servicio mock
   * (útil para alternar entre real y mock durante desarrollo)
   */
  public static shouldUseMock(): boolean {
    // Usar mock si hay problemas de conectividad o en desarrollo
    return process.env.NODE_ENV === 'development' || 
           process.env.KHIPU_USE_MOCK === 'true';
  }
}
