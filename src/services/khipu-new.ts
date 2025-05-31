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
            throw new Error('Faltan las credenciales de Khipu');
        }
    }

    private generateHmac(method: string, endpoint: string, params: Record<string, string>): string {
        // Filtrar parámetros: eliminar receiver_id, valores vacíos, null o undefined
        const filteredParams: Record<string, string> = {};
        for (const [key, value] of Object.entries(params)) {
            if (key !== 'receiver_id' && value !== undefined && value !== null && value !== '') {
                filteredParams[key] = value.toString();
            }
        }

        // Ordenar parámetros alfabéticamente por clave y construir query string
        const sortedKeys = Object.keys(filteredParams).sort();
        const queryString = sortedKeys
            .map(key => `${key}=${encodeURIComponent(filteredParams[key])}`)
            .join('&');

        // Construir el mensaje a firmar: MÉTODO&ENDPOINT&PARÁMETROS_ORDENADOS
        const stringToSign = `${method.toUpperCase()}&${endpoint}&${queryString}`;
        
        console.log('String to sign:', stringToSign);

        // Generar la firma HMAC-SHA256
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(stringToSign)
            .digest('hex');
        
        console.log('Generated signature:', signature);
        
        return signature;
    }

    async createPayment(params: CreatePaymentParams) {
        try {
            const endpoint = '/payments';
            const url = this.baseUrl + endpoint;

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

            if (params.payer_email) {
                requestParams.payer_email = params.payer_email;
            }

            const hmac = this.generateHmac('POST', endpoint, requestParams);
            
            // Convertir a URLSearchParams para envío correcto
            const formData = new URLSearchParams();
            Object.entries(requestParams).forEach(([key, value]) => {
                formData.append(key, value);
            });

            console.log('Enviando pago con parámetros:', requestParams);
            console.log('HMAC generado:', hmac);

            const response = await axios.post(url, formData, {
                headers: {
                    'Authorization': `${this.receiverId}:${hmac}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-api-key': this.apiKey
                }
            });

            console.log('Respuesta de Khipu:', response.data);
            return response.data;
        } catch (error: unknown) {
            console.error('Error al crear el pago:', error);
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                console.error('Detalles del error:', axiosError.response?.data);
                throw new Error(axiosError.response?.data?.message || 'Error al crear el pago');
            }
            throw new Error('Error al crear el pago');
        }
    }

    async getPaymentStatus(paymentId: string) {
        try {
            const endpoint = `/payments/${paymentId}`;
            const url = this.baseUrl + endpoint;

            const params: Record<string, string> = {
                receiver_id: this.receiverId
            };

            const hmac = this.generateHmac('GET', endpoint, params);

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `${this.receiverId}:${hmac}`,
                    'x-api-key': this.apiKey
                },
                params
            });

            return response.data;
        } catch (error: unknown) {
            console.error('Error al obtener el estado del pago:', error);
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                throw new Error(axiosError.response?.data?.message || 'Error al obtener el estado del pago');
            }
            throw new Error('Error al obtener el estado del pago');
        }
    }
}
