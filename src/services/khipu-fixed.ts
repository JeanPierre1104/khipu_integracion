import axios from 'axios';
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

export class KhipuService {
    private readonly receiverId: string;
    private readonly secretKey: string;
    private readonly apiKey: string;
    private readonly baseUrl = 'https://khipu.com/api/2.0';

    constructor() {
        this.receiverId = process.env.KHIPU_RECEIVER_ID || '';
        this.secretKey = process.env.KHIPU_SECRET_KEY || '';
        this.apiKey = process.env.KHIPU_API_KEY || '';
        
        if (!this.receiverId || !this.secretKey || !this.apiKey) {
            throw new Error('Faltan las credenciales de Khipu en las variables de entorno');
        }
    }

    /**
     * Genera la firma HMAC según la especificación oficial de Khipu
     * Formato: MÉTODO&URL_ENCODED&PARÁMETROS_ORDENADOS_ENCODED
     */
    private generateHmac(method: string, url: string, params: Record<string, string>): string {
        // 1. Filtrar parámetros (excluir receiver_id de la firma)
        const filteredParams: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(params)) {
            if (key !== 'receiver_id' && value !== undefined && value !== null && value !== '') {
                filteredParams[key] = value.toString();
            }
        }

        // 2. Ordenar parámetros alfabéticamente por clave
        const sortedKeys = Object.keys(filteredParams).sort();
        
        // 3. Construir query string con parámetros ordenados
        const queryString = sortedKeys
            .map(key => `${key}=${filteredParams[key]}`)
            .join('&');

        // 4. Construir el mensaje a firmar según especificación Khipu
        // Formato: MÉTODO&URL_ENCODED&PARÁMETROS_ENCODED
        const stringToSign = [
            method.toUpperCase(),
            encodeURIComponent(url),
            encodeURIComponent(queryString)
        ].join('&');

        console.log('🔐 String a firmar:', stringToSign);
        console.log('🔑 Secret key (primeros 10 chars):', this.secretKey.substring(0, 10) + '...');

        // 5. Generar la firma HMAC-SHA256
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(stringToSign, 'utf8')
            .digest('hex');

        console.log('✅ Firma generada:', signature);
        
        return signature;
    }

    /**
     * Crear un nuevo pago en Khipu
     */
    async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
        try {
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

            // Generar firma HMAC
            const hmacSignature = this.generateHmac('POST', url, requestParams);

            // Preparar datos del formulario
            const formData = new URLSearchParams();
            Object.entries(requestParams).forEach(([key, value]) => {
                formData.append(key, value);
            });

            console.log('📡 Enviando request a:', url);
            console.log('🔒 Authorization:', `${this.receiverId}:${hmacSignature}`);

            // Realizar la petición HTTP
            const response = await axios.post(url, formData.toString(), {
                headers: {
                    'Authorization': `${this.receiverId}:${hmacSignature}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': this.apiKey
                },
                timeout: 30000
            });

            console.log('✅ Respuesta exitosa de Khipu:', response.data);
            return response.data;

        } catch (error: any) {
            console.error('❌ Error al crear el pago:', error.message);
            
            if (error.response) {
                console.error('📋 Status:', error.response.status);
                console.error('📋 Headers:', error.response.headers);
                console.error('📋 Datos del error:', error.response.data);
                
                const errorMessage = error.response.data?.message || 
                                   error.response.data?.error || 
                                   `Error HTTP ${error.response.status}`;
                throw new Error(errorMessage);
            }
            
            throw new Error('Error de conexión con Khipu');
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

            const hmacSignature = this.generateHmac('GET', url, params);

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `${this.receiverId}:${hmacSignature}`,
                    'x-api-key': this.apiKey
                },
                params,
                timeout: 30000
            });

            return response.data;

        } catch (error: any) {
            console.error('❌ Error al obtener estado del pago:', error.message);
            
            if (error.response) {
                const errorMessage = error.response.data?.message || 
                                   error.response.data?.error || 
                                   `Error HTTP ${error.response.status}`;
                throw new Error(errorMessage);
            }
            
            throw new Error('Error de conexión con Khipu');
        }
    }

    /**
     * Obtener la lista de bancos disponibles
     */
    async getBanks() {
        try {
            const endpoint = '/banks';
            const url = this.baseUrl + endpoint;

            const params: Record<string, string> = {
                receiver_id: this.receiverId
            };

            const hmacSignature = this.generateHmac('GET', url, params);

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `${this.receiverId}:${hmacSignature}`,
                    'x-api-key': this.apiKey
                },
                params,
                timeout: 30000
            });

            return response.data;

        } catch (error: any) {
            console.error('❌ Error al obtener bancos:', error.message);
            
            if (error.response) {
                const errorMessage = error.response.data?.message || 
                                   error.response.data?.error || 
                                   `Error HTTP ${error.response.status}`;
                throw new Error(errorMessage);
            }
            
            throw new Error('Error de conexión con Khipu');
        }
    }
}
