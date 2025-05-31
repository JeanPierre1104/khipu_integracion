/**
 * Tests para KhipuWebPaymentForm
 * 
 * @author Desarrollador Khipu Integration Pro
 * @version 3.0.0 - SDK oficial KWS
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KhipuWebPaymentForm from '../KhipuWebPaymentForm';

// Mock del BankValidator
jest.mock('../BankValidator', () => {
  return function MockBankValidator({ amount }: { amount: number }) {
    return <div data-testid="bank-validator">BankValidator amount: {amount}</div>;
  };
});

// Mock de fetch
global.fetch = jest.fn();

// Mock del SDK de Khipu
const mockKhipuInstance = {
  startOperation: jest.fn(),
  close: jest.fn(),
  restart: jest.fn()
};

const mockKhipuConstructor = jest.fn(() => mockKhipuInstance);

// Mock de window.Khipu
Object.defineProperty(window, 'Khipu', {
  writable: true,
  value: mockKhipuConstructor
});

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('KhipuWebPaymentForm', () => {  beforeAll(() => {
    // Mock window.location una sola vez
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000'
      },
      writable: false,
      configurable: false
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('debe renderizar el formulario correctamente', () => {
    render(<KhipuWebPaymentForm />);
    
    expect(screen.getByText('💳 Pago con Khipu Web SDK')).toBeInTheDocument();
    expect(screen.getByLabelText('💰 Monto (CLP)')).toBeInTheDocument();
    expect(screen.getByLabelText('📧 Email del pagador')).toBeInTheDocument();
    expect(screen.getByLabelText('📝 Asunto del pago')).toBeInTheDocument();
    expect(screen.getByLabelText('📄 Descripción (opcional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pagar con khipu/i })).toBeInTheDocument();
  });

  test('debe validar campos requeridos', async () => {
    render(<KhipuWebPaymentForm />);
    
    const submitButton = screen.getByRole('button', { name: /pagar con khipu/i });
    fireEvent.click(submitButton);

    // El formulario HTML debe prevenir el envío si faltan campos requeridos
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('debe validar monto fuera de rango', async () => {
    render(<KhipuWebPaymentForm />);
    
    // Llenar formulario con monto inválido
    fireEvent.change(screen.getByLabelText('💰 Monto (CLP)'), {
      target: { value: '10000' } // Monto mayor al permitido
    });
    fireEvent.change(screen.getByLabelText('📧 Email del pagador'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('📝 Asunto del pago'), {
      target: { value: 'Test Payment' }
    });

    const submitButton = screen.getByRole('button', { name: /pagar con khipu/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el monto debe estar entre/i)).toBeInTheDocument();
    });
  });

  test('debe procesar pago exitosamente', async () => {
    const mockPaymentResponse = {
      success: true,
      data: {
        payment_id: 'pay_test_123',
        payment_url: 'https://khipu.com/payment/pay_test_123',
        simplified_transfer_url: 'https://khipu.com/simple/pay_test_123',
        transfer_url: 'https://khipu.com/transfer/pay_test_123',
        app_url: 'khipu://pay_test_123',
        ready_for_terminal: false
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPaymentResponse
    } as Response);

    render(<KhipuWebPaymentForm />);
    
    // Llenar formulario
    fireEvent.change(screen.getByLabelText('💰 Monto (CLP)'), {
      target: { value: '1000' }
    });
    fireEvent.change(screen.getByLabelText('📧 Email del pagador'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('📝 Asunto del pago'), {
      target: { value: 'Test Payment' }
    });

    const submitButton = screen.getByRole('button', { name: /pagar con khipu/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/payments', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 1000,
          currency: 'CLP',
          subject: 'Test Payment',
          body: '',
          payer_email: 'test@example.com',
          return_url: 'http://localhost:3000/payment/success',
          cancel_url: 'http://localhost:3000/payment/cancel',
          notify_url: 'http://localhost:3000/api/notify'
        })
      }));
    });

    await waitFor(() => {
      expect(mockKhipuConstructor).toHaveBeenCalled();
      expect(mockKhipuInstance.startOperation).toHaveBeenCalledWith(
        'pay_test_123',
        expect.any(Function),
        expect.objectContaining({
          modal: true,
          modalOptions: {
            maxWidth: 450,
            maxHeight: 860
          }
        })
      );
    });
  });

  test('debe manejar error cuando Khipu SDK no está disponible', async () => {
    // Temporalmente remover window.Khipu
    const originalKhipu = window.Khipu;
    delete (window as any).Khipu;

    const mockPaymentResponse = {
      success: true,
      data: { payment_id: 'pay_test_123' }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPaymentResponse
    } as Response);

    render(<KhipuWebPaymentForm />);
    
    // Llenar y enviar formulario
    fireEvent.change(screen.getByLabelText('💰 Monto (CLP)'), {
      target: { value: '1000' }
    });
    fireEvent.change(screen.getByLabelText('📧 Email del pagador'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('📝 Asunto del pago'), {
      target: { value: 'Test Payment' }
    });

    const submitButton = screen.getByRole('button', { name: /pagar con khipu/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/sdk de khipu no está disponible/i)).toBeInTheDocument();
    });

    // Restaurar window.Khipu
    window.Khipu = originalKhipu;
  });

  test('debe pasar amount correcto al BankValidator', () => {
    render(<KhipuWebPaymentForm />);
    
    fireEvent.change(screen.getByLabelText('💰 Monto (CLP)'), {
      target: { value: '2500' }
    });

    expect(screen.getByTestId('bank-validator')).toHaveTextContent('BankValidator amount: 2500');
  });

  test('debe manejar callbacks del SDK de Khipu', async () => {
    const mockPaymentResponse = {
      success: true,
      data: { payment_id: 'pay_test_123' }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPaymentResponse
    } as Response);

    render(<KhipuWebPaymentForm />);
    
    // Llenar y enviar formulario
    fireEvent.change(screen.getByLabelText('💰 Monto (CLP)'), {
      target: { value: '1000' }
    });
    fireEvent.change(screen.getByLabelText('📧 Email del pagador'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('📝 Asunto del pago'), {
      target: { value: 'Test Payment' }
    });

    const submitButton = screen.getByRole('button', { name: /pagar con khipu/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockKhipuInstance.startOperation).toHaveBeenCalled();
    });

    // Simular callback exitoso del SDK
    const callback = mockKhipuInstance.startOperation.mock.calls[0][1];
    const mockResult = {
      operationId: 'pay_test_123',
      exitTitle: 'Pago exitoso',
      exitMessage: 'El pago se procesó correctamente',
      exitUrl: 'https://example.com/success',
      result: 'OK' as const,
      events: []
    };

    callback(mockResult);

    await waitFor(() => {
      expect(screen.getByText('Pago exitoso')).toBeInTheDocument();
      expect(screen.getByText('El pago se procesó correctamente')).toBeInTheDocument();
    });
  });
});
