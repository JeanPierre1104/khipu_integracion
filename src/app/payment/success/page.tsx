'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Obtener parámetros de Khipu
    const paymentId = searchParams.get('payment_id');
    const transactionId = searchParams.get('transaction_id');
    
    // Construir URL de redirección al inicio con parámetros
    const params = new URLSearchParams();
    params.set('payment', 'success');
    
    if (paymentId) {
      params.set('payment_id', paymentId);
    }
    
    if (transactionId) {
      params.set('transaction_id', transactionId);
    }

    // Redirigir al inicio con los parámetros
    console.log('🎉 Payment successful, redirecting to home with params:', params.toString());
    router.replace(`/?${params.toString()}`);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-green-800 mb-2">¡Pago Exitoso!</h2>
        <p className="text-green-600">Redirigiendo al inicio...</p>
      </div>
    </div>
  );
}