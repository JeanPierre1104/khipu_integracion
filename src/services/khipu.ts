import axios, { isAxiosError } from 'axios';
import crypto from 'crypto';

interface CreatePaymentParams {
    amount: number;
    currency: string;
    subject: string;
    body: string;
    transaction_id: string;
    payer_email?: string;
}

interface PaymentResponse {
    payment_id: string;
    payment_url: string;
    simplified_transfer_url: string;
    transfer_url: string;
    app_url: string;
    ready_for_terminal: boolean;
}

// Helper function to check if error has expected properties
function hasAxiosErrorStructure(error: unknown): error is { response?: { data?: Record<string, unknown>; status: number } } {
    return typeof error === 'object' && error !== null && 'response' in error;
}

export class KhipuService {
    private readonly receiverId: string;
    private readonly secretKey: string;
    private readonly apiKey: string;
    private readonly baseUrl = 'https://khipu.com/api/2.0';

    constructor() {
        this.receiverId = process.env.KHIPU_RECEIVER_ID || '';
        this.secretKey = process.env.KHIPU_SECRET_KEY || '';
        this.apiKey = process.env.KHIPU_API_KEY || '';
        
        console.log('🔧 Inicializando KhipuService');
        console.log('🆔 Receiver ID:', this.receiverId);
        console.log('🔑 Secret Key (primeros 8 chars):', this.secretKey?.substring(0, 8) + '...');
        console.log('🗝️ API Key (primeros 8 chars):', this.apiKey?.substring(0, 8) + '...');
        
        if (!this.receiverId || !this.secretKey || !this.apiKey) {
            throw new Error('Faltan las credenciales de Khipu en las variables de entorno');
        }
    }

    /**
     * Genera la firma HMAC según la especificación EXACTA de Khipu
     */
    private generateHmac(method: string, endpoint: string, params: Record<string, string>): string {
        console.log('🔐 Generando HMAC...');
        console.log('📋 Método:', method);
        console.log('🎯 Endpoint:', endpoint);
        console.log('📊 Parámetros completos:', params);

        // 1. Filtrar parámetros: SOLO eliminar receiver_id de la firma
        const filteredParams: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(params)) {
            // Khipu NO incluye receiver_id en la firma HMAC
            if (key !== 'receiver_id' && value !== undefined && value !== null && value !== '') {
                filteredParams[key] = value.toString();
            }
        }

        console.log('🧹 Parámetros filtrados:', filteredParams);

        // 2. Ordenar parámetros alfabéticamente por clave
        const sortedKeys = Object.keys(filteredParams).sort();
        console.log('🔤 Claves ordenadas:', sortedKeys);
        
        // 3. Construir query string EXACTO - SIN encodeURIComponent aquí
        const queryString = sortedKeys
            .map(key => `${key}=${filteredParams[key]}`)
            .join('&');

        console.log('📝 Query string:', queryString);

        // 4. Construir el mensaje a firmar según especificación EXACTA de Khipu
        // Formato: MÉTODO&ENDPOINT&QUERY_STRING
        const stringToSign = `${method.toUpperCase()}&${endpoint}&${queryString}`;

        console.log('✍️ String to sign:', stringToSign);

        // 5. Generar la firma HMAC-SHA256
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(stringToSign, 'utf8')
            .digest('hex');

        console.log('🔒 Firma generada:', signature);
        
        return signature;
    }

    /**
     * Crear un nuevo pago en Khipu
     */
    async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
        try {
            console.log('💳 Iniciando creación de pago...');
            
            const endpoint = '/payments';
            const url = this.baseUrl + endpoint;

            // Preparar parámetros del request
            const requestParams: Record<string, string> = {
                receiver_id: this.receiverId,
                subject: params.subject,
                body: params.body,
                amount: params.amount.toString(),
                currency: params.currency,
                transaction_id: params.transaction_id,
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
                notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/notify`,
                notify_api_version: '1.3'
            };

            // Agregar email del pagador si se proporciona
            if (params.payer_email) {
                requestParams.payer_email = params.payer_email;
            }

            console.log('📤 Parámetros del pago:', requestParams);

            // Generar firma HMAC usando SOLO el endpoint, no la URL completa
            const hmacSignature = this.generateHmac('POST', endpoint, requestParams);

            // Preparar datos del formulario
            const formData = new URLSearchParams();
            Object.entries(requestParams).forEach(([key, value]) => {
                formData.append(key, value);
            });

            console.log('📡 URL de la petición:', url);
            console.log('🔒 Header Authorization:', `${this.receiverId}:${hmacSignature}`);

            // Realizar la petición HTTP
            const response = await axios.post(url, formData.toString(), {
                headers: {
                    'Authorization': `${this.receiverId}:${hmacSignature}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': this.apiKey,
                    'User-Agent': 'PruebaTecnica/1.0'
                },
                timeout: 30000
            });            console.log('✅ Respuesta exitosa de Khipu:', response.data);
            return response.data;

        } catch (error: unknown) {
            console.error('❌ Error al crear el pago:', error);
            
            if (isAxiosError(error) && error.response) {
                console.error('📋 Status HTTP:', error.response.status);                console.error('📋 Headers de respuesta:', error.response.headers);
                console.error('📋 Datos del error:', error.response.data);
                
                const responseData = error.response.data as Record<string, unknown>;
                const errorMessage = String(responseData?.message ||
                                   responseData?.error || 
                                   `Error HTTP ${error.response.status}`);
                throw new Error(errorMessage);
            } else if (hasAxiosErrorStructure(error) && error.response) {
                const responseData = error.response.data as Record<string, unknown>;
                const errorMessage = String(responseData?.message ||
                                   responseData?.error || 
                                   `Error HTTP ${error.response.status}`);
                throw new Error(errorMessage);
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            throw new Error('Error de conexión con Khipu: ' + errorMessage);
        }
    }

    /**
     * Obtener el estado de un pago
     */
    async getPaymentStatus(paymentId: string) {
        try {
            const endpoint = `/payments/${paymentId}`;
            const url = this.baseUrl + endpoint;

            const params: Record<string, string> = {
                receiver_id: this.receiverId
            };

            const hmacSignature = this.generateHmac('GET', endpoint, params);

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `${this.receiverId}:${hmacSignature}`,
                    'x-api-key': this.apiKey
                },
                params,
                timeout: 30000
            });

            return response.data;        } catch (error: unknown) {
            console.error('❌ Error al obtener estado del pago:', error);
            
            if (isAxiosError(error) && error.response) {
                const responseData = error.response.data as Record<string, unknown>;
                const errorMessage = String(responseData?.message || 
                                   responseData?.error || 
                                   `Error HTTP ${error.response.status}`);
                throw new Error(errorMessage);
            } else if (hasAxiosErrorStructure(error) && error.response) {
                const responseData = error.response.data as Record<string, unknown>;
                const errorMessage = String(responseData?.message || 
                                   responseData?.error || 
                                   `Error HTTP ${error.response.status}`);
                throw new Error(errorMessage);
            }
            
            throw new Error('Error de conexión con Khipu');
        }
    }

    /**
     * Obtener la lista de bancos disponibles - MÉTODO SIMPLIFICADO PARA TESTING
     */
    async getBanks() {
        try {
            console.log('🏦 Obteniendo lista de bancos...');
            
            const endpoint = '/banks';
            const url = this.baseUrl + endpoint;

            // Para el endpoint de bancos, NO enviamos parámetros adicionales
            const params: Record<string, string> = {
                receiver_id: this.receiverId
            };

            const hmacSignature = this.generateHmac('GET', endpoint, params);

            console.log('📡 URL para bancos:', url);
            console.log('🔒 Authorization para bancos:', `${this.receiverId}:${hmacSignature}`);

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `${this.receiverId}:${hmacSignature}`,
                    'x-api-key': this.apiKey,
                    'User-Agent': 'PruebaTecnica/1.0'
                },
                params,
                timeout: 30000
            });

            console.log('✅ Bancos obtenidos exitosamente');
            return response.data;        } catch (error: unknown) {
            console.error('❌ Error al obtener bancos:', error);
            
            if (isAxiosError(error) && error.response) {
                console.error('📋 Status HTTP:', error.response.status);
                console.error('📋 Datos del error:', error.response.data);
                
                const responseData = error.response.data as Record<string, unknown>;
                const errorMessage = String(responseData?.message || 
                                   responseData?.error || 
                                   `Error HTTP ${error.response.status}`);
                throw new Error(errorMessage);
            } else if (hasAxiosErrorStructure(error) && error.response) {
                const responseData = error.response.data as Record<string, unknown>;
                const errorMessage = String(responseData?.message || 
                                   responseData?.error || 
                                   `Error HTTP ${error.response.status}`);
                throw new Error(errorMessage);
            }
            
            throw new Error('Error de conexión con Khipu');
        }
    }
}