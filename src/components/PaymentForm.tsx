'use client';

import { useState } from 'react';
import { BankValidator } from './BankValidator';

export default function PaymentForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [formData, setFormData] = useState({
        amount: '',
        email: '',
        subject: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const amount = parseInt(formData.amount);
            if (isNaN(amount) || amount < 1 || amount > 5000) {
                throw new Error('El monto debe estar entre $1 y $5.000 CLP');
            }

            console.log('🚀 Enviando pago a API:', formData);
            
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: 'CLP',
                    subject: formData.subject,
                    body: formData.description,
                    payer_email: formData.email,
                    return_url: `${window.location.origin}/payment/success`,
                    cancel_url: `${window.location.origin}/payment/cancel`,
                    notify_url: `${window.location.origin}/api/notify`
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar el pago');
            }            console.log('✅ Pago creado exitosamente:', data);
            
            // Guardar URL de pago y mostrar éxito
            setPaymentUrl(data.data.payment_url);
            setSuccess(true);
            
            // Redirigir automáticamente a la URL de pago de Khipu
            window.open(data.data.payment_url, '_blank');
            
        } catch (err: any) {
            console.error('❌ Error en pago:', err);
            setError(err.message || 'Error al procesar el pago');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const redirectToPayment = () => {
        if (paymentUrl) {
            window.open(paymentUrl, '_blank');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                💳 Pago con Khipu
            </h2>
            
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        {error}
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    <div className="flex items-center mb-2">
                        <span className="text-green-500 mr-2">✅</span>
                        ¡Pago creado exitosamente!
                    </div>
                    <p className="text-sm text-green-600 mb-3">
                        Se ha abierto una nueva ventana con el formulario de pago de Khipu.
                    </p>
                    <button
                        onClick={redirectToPayment}
                        className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        🔗 Abrir página de pago nuevamente
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        💰 Monto (CLP)
                    </label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        max="5000"
                        min="1"
                        placeholder="Máximo $5.000 CLP"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Monto límite para prueba técnica: $1 - $5.000 CLP
                    </p>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        📧 Email del pagador
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="correo@ejemplo.com"
                    />
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        📝 Asunto del pago
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Ej: Compra de producto"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        📄 Descripción (opcional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Descripción detallada del pago (opcional)"
                    />
                </div>

                {/* Componente de validación de bancos */}
                <div className="pt-2 border-t border-gray-200">
                    <BankValidator />
                </div>

                <button
                    type="submit"
                    disabled={loading || success}
                    className={`w-full py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                        loading || success
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando pago...
                        </span>
                    ) : success ? (
                        '✅ Pago creado'
                    ) : (
                        '💳 Crear pago con Khipu'
                    )}
                </button>
            </form>

            {success && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">📋 Próximos pasos:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Completa el pago en la ventana de Khipu</li>
                        <li>• Serás redirigido automáticamente al finalizar</li>
                        <li>• Puedes cerrar esta ventana</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
