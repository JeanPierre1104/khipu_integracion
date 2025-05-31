/**
 * Servicio Principal de Khipu API v3
 * 
 * Implementación siguiendo documentación oficial de Khipu
 * Basado en la especificación exacta de la API v3
 * 
 * @author Desarrollador Khipu Integration Pro
 * @version 3.0.1 - Actualizado con documentación oficial
 */

// Interfaces TypeScript para tipado fuerte según documentación oficial API v3
export interface PaymentRequest {
  amount: number;
  currency: string;
  subject: string;
  payer_email?: string;
  body?: string;
  transaction_id?: string;
  custom?: string;
  notify_url?: string;
  return_url?: string;
  cancel_url?: string;
  picture_url?: string;
  expires_date?: string;
  send_email?: boolean;
  send_reminders?: boolean;
  responsible_user_email?: string;
  fixed_payer_personal_identifier?: string;
  integrator_fee?: number;
  collect_account_uuid?: string;
  confirm_timeout_date?: string;
  mandatory_payment_method?: string;
}

export interface PaymentResponse {
  payment_id: string;
  payment_url: string;
  simplified_transfer_url: string;
  transfer_url: string;
  app_url: string;
  ready_for_terminal: boolean;
}

export interface KhipuErrorResponse {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaymentInfo {
  payment_id: string;
  payment_url: string;
  simplified_transfer_url: string;
  transfer_url: string;
  webpay_url: string;
  hites_url: string;
  payme_url: string;
  app_url: string;
  ready_for_terminal: boolean;
  notification_token: string;
  receiver_id: number;
  conciliation_date: string;
  subject: string;
  amount: number;
  currency: string;
  status: string;
  status_detail: string;
  body: string;
  picture_url: string;
  receipt_url: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  notify_api_version: string;
  expires_date: string;
  attachment_urls: string[];
  bank: string;
  bank_id: string;
  payer_name: string;
  payer_email: string;
  personal_identifier: string;
  bank_account_number: string;
  out_of_date_conciliation: boolean;
  transaction_id: string;
  custom: string;
  responsible_user_email: string;
  send_reminders: boolean;
  send_email: boolean;
  payment_method: string;
}

export interface BankInfo {
  bank_id: string;
  name: string;
  message: string;
  min_amount: number;
  type: string;
  parent: string;
}

/**
 * Clase principal para manejo de Khipu API v3
 * Implementación híbrida que soporta tanto v2 como v3 según el endpoint
 */
export class KhipuService {
  private static instance: KhipuService;
  private readonly baseUrl = 'https://payment-api.khipu.com/v3';
  private readonly apiKey: string;
  private readonly receiverId: string;
  private readonly secretKey: string;

  private constructor() {
    this.apiKey = process.env.KHIPU_API_KEY || '';
    this.receiverId = process.env.KHIPU_RECEIVER_ID || '';
    this.secretKey = process.env.KHIPU_SECRET_KEY || '';
    
    if (!this.apiKey || !this.receiverId || !this.secretKey) {
      throw new Error('Configuración de Khipu incompleta. Verificar variables: KHIPU_API_KEY, KHIPU_RECEIVER_ID, KHIPU_SECRET_KEY');
    }
    
    console.log('🔧 KhipuService inicializado:');
    console.log('📍 API Key (v3):', this.apiKey.substring(0, 8) + '...');
    console.log('📍 Receiver ID (v2):', this.receiverId);
    console.log('📍 Secret Key (v2):', this.secretKey.substring(0, 8) + '...');
  }

  /**
   * Obtiene instancia singleton del servicio
   */
  public static getInstance(): KhipuService {
    if (!KhipuService.instance) {
      KhipuService.instance = new KhipuService();
    }
    return KhipuService.instance;
  }  /**
   * Headers estándar para API v3 según documentación oficial
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'Accept': 'application/json'
    };
  }

  /**
   * Headers con autenticación v2 (para endpoints híbridos)
   */
  private getV2Headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Genera parámetros de autenticación v2 para la URL
   */
  private getV2AuthParams(): string {
    return `receiver_id=${this.receiverId}&secret=${this.secretKey}`;
  }  /**
   * Manejo centralizado de errores HTTP según documentación API v3
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();
    console.log(`📡 Khipu API Response [${response.status}]:`, text);
    
    try {
      const data = JSON.parse(text);
        // Verificar si hay errores estructurados en la respuesta
      if (data.error_payment_post_payments) {
        const errorBody = JSON.parse(data.error_payment_post_payments.http_body);
        throw new Error(`Error de Khipu: ${errorBody.message}${errorBody.errors ? ' - ' + errorBody.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(', ') : ''}`);
      }
      
      if (!response.ok) {
        // Manejo específico de errores según documentación
        if (response.status === 400) {
          throw new Error(`Error de validación: ${data.message || 'Datos inválidos'}`);
        } else if (response.status === 401) {
          throw new Error(`Error de autenticación: API Key inválida o expirada`);
        } else if (response.status === 403) {
          throw new Error(`Error de autorización: Sin permisos para esta operación`);
        } else if (response.status === 404) {
          throw new Error(`Recurso no encontrado: ${data.message || 'Endpoint no existe'}`);
        } else if (response.status >= 500) {
          throw new Error(`Error del servidor Khipu: ${data.message || 'Error interno'}`);
        } else {
          throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Respuesta inválida de Khipu API: ${text}`);
      }
      throw error;
    }
  }/**
   * Crear nuevo pago - Método principal según documentación oficial
   */
  public async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🚀 Creando pago con Khipu API v3 (versión oficial)');
      console.log('📊 Datos del pago:', JSON.stringify(paymentData, null, 2));
      console.log('🔗 URL de API:', `${this.baseUrl}/payments`);
      console.log('🔑 API Key (primeros 8 chars):', this.apiKey.substring(0, 8) + '...');

      // Validaciones básicas antes de enviar
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Amount debe ser mayor que 0');
      }
      
      if (!paymentData.currency) {
        throw new Error('Currency es requerido');
      }
      
      if (!paymentData.subject || paymentData.subject.trim().length === 0) {
        throw new Error('Subject es requerido');
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log('⏰ Request timeout después de 15 segundos');
      }, 15000); // 15 second timeout
      
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(paymentData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await this.handleResponse<PaymentResponse>(response);
      
      console.log('✅ Pago creado exitosamente:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error detallado creando pago:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        paymentData: paymentData
      });

      // Handle specific timeout/abort errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: La API de Khipu no respondió en 15 segundos');
        }
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
          throw new Error('Error de conectividad: No se puede conectar con la API de Khipu');
        }
      }
      
      throw new Error(`Error creando pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener información de un pago por ID
   */
  public async getPayment(paymentId: string): Promise<PaymentInfo> {
    try {
      console.log('🔍 Obteniendo pago:', paymentId);
      
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<PaymentInfo>(response);
      
      console.log('✅ Pago obtenido:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error obteniendo pago:', error);
      throw new Error(`Error obteniendo pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Listar pagos con filtros opcionales
   */
  public async listPayments(filters?: {
    page?: number;
    page_size?: number;
    status?: string;
    since?: string;
    until?: string;
  }): Promise<{
    payments: PaymentInfo[];
    page: number;
    page_size: number;
    total_pages: number;
    total_count: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.baseUrl}/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('📋 Listando pagos:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<{
        payments: PaymentInfo[];
        page: number;
        page_size: number;
        total_pages: number;
        total_count: number;
      }>(response);
      
      console.log('✅ Pagos obtenidos:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error listando pagos:', error);
      throw new Error(`Error listando pagos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }  /**
   * Obtener bancos disponibles (usando autenticación híbrida)
   */
  public async getBanks(): Promise<BankInfo[]> {
    try {
      console.log('🏦 Obteniendo bancos disponibles con autenticación híbrida');
      
      // Primero intentar con API v3
      try {
        console.log('📡 Intentando con API Key v3...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log('⏰ Request timeout después de 10 segundos');
        }, 10000);
        
        const response = await fetch(`${this.baseUrl}/banks`, {
          method: 'GET',
          headers: this.getHeaders(),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const result = await this.handleResponse<{ banks: BankInfo[] }>(response);
        console.log('✅ Bancos obtenidos con v3:', result.banks);
        return result.banks;
        
      } catch (v3Error) {
        console.warn('⚠️ API v3 falló, intentando con v2:', v3Error);
        
        // Fallback a v2
        const v2Url = `https://khipu.com/api/2.0/banks?${this.getV2AuthParams()}`;
        console.log('📡 Intentando con API v2:', v2Url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.log('⏰ Request v2 timeout después de 10 segundos');
        }, 10000);
        
        const response = await fetch(v2Url, {
          method: 'GET',
          headers: this.getV2Headers(),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const result = await this.handleResponse<{ banks: BankInfo[] }>(response);
        console.log('✅ Bancos obtenidos con v2:', result.banks);
        return result.banks;
      }
      
    } catch (error) {
      console.error('❌ Error obteniendo bancos:', error);
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: La API de Khipu no respondió en 10 segundos');
        }
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
          throw new Error('Error de conectividad: No se puede conectar con la API de Khipu');
        }
      }
      
      throw new Error(`Error obteniendo bancos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Validar configuración de API
   */
  public async validateConfiguration(): Promise<boolean> {
    try {
      console.log('🔧 Validando configuración de Khipu API');
      
      // Intentar obtener bancos como test de conectividad
      await this.getBanks();
      
      console.log('✅ Configuración válida');
      return true;
      
    } catch (error) {
      console.error('❌ Configuración inválida:', error);
      return false;
    }
  }
}

/**
 * Funciones de utilidad para uso directo
 */

/**
 * Crear pago de forma estática
 */
export async function createKhipuPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  const service = KhipuService.getInstance();
  return service.createPayment(paymentData);
}

/**
 * Obtener información de pago de forma estática
 */
export async function getKhipuPayment(paymentId: string): Promise<PaymentInfo> {
  const service = KhipuService.getInstance();
  return service.getPayment(paymentId);
}

/**
 * Listar pagos de forma estática
 */
export async function listKhipuPayments(filters?: {
  page?: number;
  page_size?: number;
  status?: string;
  since?: string;
  until?: string;
}): Promise<{
  payments: PaymentInfo[];
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
}> {
  const service = KhipuService.getInstance();
  return service.listPayments(filters);
}

/**
 * Obtener bancos de forma estática
 */
export async function getKhipuBanks(): Promise<BankInfo[]> {
  const service = KhipuService.getInstance();
  return service.getBanks();
}

// Export default del servicio
export default KhipuService;
